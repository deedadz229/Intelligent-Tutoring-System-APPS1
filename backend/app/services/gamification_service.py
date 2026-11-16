from datetime import date, datetime, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import User, UserLevel
from app.models.gamification import (
    XPTransaction,
    Achievement,
    UserAchievement,
    DailyQuest,
    QuestProgress
)
from app.models.chat import ChatHistory
from app.schemas.gamification import (
    UserProfileResponse,
    ProgressResponse,
    AchievementsResponse,
    AchievementItem,
    QuestsResponse,
    QuestItem,
    CompleteQuestResponse,
    LeaderboardResponse,
    LeaderboardItem
)

class GamificationService:
    def _calculate_level_info(self, db: Session, total_xp: int) -> Tuple[int, str, str, int, int, float]:
        """
        Menghitung level dinamis dan progres XP berikutnya.
        Mengembalikan: (level, title, badge_icon, min_xp, next_level_min_xp, progress_percentage)
        """
        levels = db.query(UserLevel).order_by(UserLevel.level.asc()).all()
        if not levels:
            # Fallback jika database belum terisi
            level = max(1, total_xp // 100 + 1)
            min_xp = (level - 1) * 100
            max_xp = level * 100
            pct = min(100.0, max(0.0, ((total_xp - min_xp) / 100.0) * 100))
            return level, "Mahasiswa Baru", "badge_freshman", min_xp, max_xp, round(pct, 1)

        # Cari tier level yang sesuai
        current_lvl = levels[0]
        next_min_xp = levels[1].min_xp if len(levels) > 1 else 250

        for idx, lvl in enumerate(levels):
            if total_xp >= lvl.min_xp:
                current_lvl = lvl
                if idx + 1 < len(levels):
                    next_min_xp = levels[idx + 1].min_xp
                else:
                    # Di atas level maksimal terdaftar
                    extra_levels = (total_xp - lvl.min_xp) // 500
                    next_min_xp = lvl.min_xp + (extra_levels + 1) * 500

        span = max(1, next_min_xp - current_lvl.min_xp)
        current_in_lvl = max(0, total_xp - current_lvl.min_xp)
        pct = min(100.0, (current_in_lvl / span) * 100.0)

        return current_lvl.level, current_lvl.title, current_lvl.badge_icon, current_lvl.min_xp, next_min_xp, round(pct, 1)

    def get_user(self, db: Session, user_id: int) -> User:
        """Mengambil data pengguna dari database. Tidak membuat akun secara otomatis."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"Mahasiswa dengan ID {user_id} tidak ditemukan. Silakan login atau registrasi terlebih dahulu.")
        return user

    def add_xp(
        self,
        db: Session,
        user_id: int,
        amount: int,
        source: str,
        description: str
    ) -> Tuple[int, int, bool]:
        """
        Menambahkan XP ke pengguna secara transaksional dan menghitung kenaikan level.
        Mengembalikan: (new_total_xp, current_level, level_up)
        """
        user = self.get_user(db, user_id)
        old_level = user.level

        # Catat mutasi XP
        tx = XPTransaction(
            user_id=user_id,
            amount=amount,
            source=source,
            description=description,
            created_at=datetime.now(timezone.utc)
        )
        db.add(tx)

        # Update akumulasi XP
        user.total_xp += amount

        # Hitung level baru
        new_lvl, _, _, _, _, _ = self._calculate_level_info(db, user.total_xp)
        level_up = new_lvl > old_level
        user.level = new_lvl
        user.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(user)

        # Evaluasi pencapaian terkait level dan XP
        self._check_and_unlock_achievements(db, user)

        return user.total_xp, user.level, level_up

    def _check_and_unlock_achievements(self, db: Session, user: User) -> List[str]:
        """Evaluasi kondisi pencapaian (Achievements) untuk pengguna."""
        unlocked_codes = []
        existing_ach_ids = {
            ua.achievement_id for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        }

        # 1. First question
        if "ach_first_question" not in existing_ach_ids:
            chat_count = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).count()
            if chat_count >= 1:
                self._unlock_achievement(db, user, "ach_first_question")
                unlocked_codes.append("Langkah Perdana")

        # 2. Curious mind (5 questions)
        if "ach_curious_mind" not in existing_ach_ids:
            chat_count = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).count()
            if chat_count >= 5:
                self._unlock_achievement(db, user, "ach_curious_mind")
                unlocked_codes.append("Rasa Ingin Tahu Tinggi")

        # 3. Scholar rank (Level 3+)
        if "ach_scholar_rank" not in existing_ach_ids:
            if user.level >= 3:
                self._unlock_achievement(db, user, "ach_scholar_rank")
                unlocked_codes.append("Cendekiawan Muda")

        # 4. Quest hunter (3+ completed quests)
        if "ach_quest_hunter" not in existing_ach_ids:
            completed_quests = db.query(QuestProgress).filter(
                QuestProgress.user_id == user.id,
                QuestProgress.is_completed == True
            ).count()
            if completed_quests >= 3:
                self._unlock_achievement(db, user, "ach_quest_hunter")
                unlocked_codes.append("Pemburu Quest")

        # 5. Academic Mastery (500+ XP)
        if "ach_mastery" not in existing_ach_ids:
            if user.total_xp >= 500:
                self._unlock_achievement(db, user, "ach_mastery")
                unlocked_codes.append("Master Regulasi Kampus")

        # 6. Peneliti Presisi (Cosine Similarity >= 0.70)
        if "ach_cosine_expert" not in existing_ach_ids:
            has_high_cosine = db.query(ChatHistory).filter(
                ChatHistory.user_id == user.id,
                ChatHistory.match_method == "cosine_similarity",
                ChatHistory.score >= 0.70
            ).first()
            if has_high_cosine:
                self._unlock_achievement(db, user, "ach_cosine_expert")
                unlocked_codes.append("Peneliti Presisi")

        # 7. Detektif Saltik (Fuzzy Matching >= 75)
        if "ach_fuzzy_explorer" not in existing_ach_ids:
            has_fuzzy = db.query(ChatHistory).filter(
                ChatHistory.user_id == user.id,
                ChatHistory.match_method == "fuzzy_matching"
            ).first()
            if has_fuzzy:
                self._unlock_achievement(db, user, "ach_fuzzy_explorer")
                unlocked_codes.append("Detektif Saltik")

        return unlocked_codes

    def _unlock_achievement(self, db: Session, user: User, achievement_id: str) -> None:
        ach = db.query(Achievement).filter(Achievement.id == achievement_id).first()
        if not ach:
            return

        ua = UserAchievement(
            user_id=user.id,
            achievement_id=achievement_id,
            unlocked_at=datetime.now(timezone.utc)
        )
        db.add(ua)

        # Berikan XP reward dari pencapaian tersebut
        tx = XPTransaction(
            user_id=user.id,
            amount=ach.xp_reward,
            source="achievement_unlocked",
            description=f"Pencapaian terbuka: {ach.title}",
            created_at=datetime.now(timezone.utc)
        )
        db.add(tx)
        user.total_xp += ach.xp_reward

        # Update level lagi bila bertambah
        new_lvl, _, _, _, _, _ = self._calculate_level_info(db, user.total_xp)
        user.level = new_lvl

        db.commit()

    def get_profile(self, db: Session, user_id: int = 1) -> UserProfileResponse:
        user = self.get_user(db, user_id)
        lvl, title, icon, min_xp, next_min_xp, pct = self._calculate_level_info(db, user.total_xp)
        xp_needed = max(0, next_min_xp - user.total_xp)

        unlocked_count = db.query(UserAchievement).filter(UserAchievement.user_id == user.id).count()

        return UserProfileResponse(
            user_id=user.id,
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            total_xp=user.total_xp,
            level=lvl,
            level_title=title,
            badge_icon=icon,
            current_streak=user.current_streak,
            current_level_min_xp=min_xp,
            next_level_min_xp=next_min_xp,
            xp_needed_for_next_level=xp_needed,
            progress_percentage=pct,
            unlocked_achievements_count=unlocked_count
        )

    def get_progress(self, db: Session, user_id: int = 1) -> ProgressResponse:
        user = self.get_user(db, user_id)
        lvl, title, icon, min_xp, next_min_xp, pct = self._calculate_level_info(db, user.total_xp)
        current_in_level = max(0, user.total_xp - min_xp)
        xp_needed = max(0, next_min_xp - user.total_xp)

        today = date.today()
        daily_completed = db.query(QuestProgress).filter(
            QuestProgress.user_id == user.id,
            QuestProgress.quest_date == today,
            QuestProgress.is_completed == True
        ).count()
        daily_total = db.query(DailyQuest).filter(DailyQuest.is_active == True).count()

        ach_unlocked = db.query(UserAchievement).filter(UserAchievement.user_id == user.id).count()
        ach_total = db.query(Achievement).count()

        return ProgressResponse(
            user_id=user.id,
            level=lvl,
            level_title=title,
            badge_icon=icon,
            total_xp=user.total_xp,
            current_level_min_xp=min_xp,
            next_level_min_xp=next_min_xp,
            current_xp_in_level=current_in_level,
            xp_needed_for_next_level=xp_needed,
            progress_percentage=pct,
            daily_quests_completed=daily_completed,
            daily_quests_total=daily_total,
            achievements_unlocked=ach_unlocked,
            achievements_total=ach_total
        )

    def get_achievements(self, db: Session, user_id: int = 1) -> AchievementsResponse:
        user = self.get_user(db, user_id)
        all_ach = db.query(Achievement).order_by(Achievement.xp_reward.asc()).all()
        user_ach = {
            ua.achievement_id: ua.unlocked_at
            for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        }

        items = []
        for ach in all_ach:
            is_unl = ach.id in user_ach
            items.append(AchievementItem(
                id=ach.id,
                code=ach.code,
                title=ach.title,
                description=ach.description,
                badge_icon=ach.badge_icon,
                xp_reward=ach.xp_reward,
                category=ach.category,
                is_unlocked=is_unl,
                unlocked_at=user_ach.get(ach.id)
            ))

        return AchievementsResponse(
            total_unlocked=len(user_ach),
            total_available=len(all_ach),
            achievements=items
        )

    def get_quests(self, db: Session, user_id: int = 1) -> QuestsResponse:
        user = self.get_user(db, user_id)
        today = date.today()
        active_quests = db.query(DailyQuest).filter(DailyQuest.is_active == True).all()

        items = []
        completed_count = 0

        for q in active_quests:
            progress = db.query(QuestProgress).filter(
                QuestProgress.user_id == user.id,
                QuestProgress.quest_id == q.id,
                QuestProgress.quest_date == today
            ).first()

            if not progress:
                # Inisialisasi progress untuk hari ini
                cur_cnt = 1 if q.id == "quest_daily_login" else 0
                is_comp = cur_cnt >= q.target_count
                progress = QuestProgress(
                    user_id=user.id,
                    quest_id=q.id,
                    current_count=cur_cnt,
                    is_completed=is_comp,
                    quest_date=today
                )
                db.add(progress)
                db.commit()
                db.refresh(progress)

            if progress.is_completed:
                completed_count += 1

            can_comp = (not progress.is_completed) and (progress.current_count >= q.target_count)

            items.append(QuestItem(
                id=q.id,
                title=q.title,
                description=q.description,
                target_count=q.target_count,
                current_count=progress.current_count,
                xp_reward=q.xp_reward,
                category=q.category,
                is_completed=progress.is_completed,
                can_complete=can_comp
            ))

        return QuestsResponse(
            date=str(today),
            completed_count=completed_count,
            total_quests=len(items),
            quests=items
        )

    def complete_quest(self, db: Session, quest_id: str, user_id: int = 1) -> CompleteQuestResponse:
        user = self.get_user(db, user_id)
        today = date.today()

        quest = db.query(DailyQuest).filter(DailyQuest.id == quest_id).first()
        if not quest:
            return CompleteQuestResponse(
                success=False,
                message=f"Quest dengan ID '{quest_id}' tidak ditemukan.",
                quest_id=quest_id,
                xp_awarded=0,
                new_total_xp=user.total_xp,
                level=user.level,
                level_up=False,
                new_achievements=[]
            )

        progress = db.query(QuestProgress).filter(
            QuestProgress.user_id == user.id,
            QuestProgress.quest_id == quest_id,
            QuestProgress.quest_date == today
        ).first()

        if not progress:
            progress = QuestProgress(
                user_id=user.id,
                quest_id=quest_id,
                current_count=quest.target_count,
                is_completed=False,
                quest_date=today
            )
            db.add(progress)

        if progress.is_completed:
            return CompleteQuestResponse(
                success=False,
                message=f"Quest '{quest.title}' sudah diselesaikan hari ini.",
                quest_id=quest_id,
                xp_awarded=0,
                new_total_xp=user.total_xp,
                level=user.level,
                level_up=False,
                new_achievements=[]
            )

        # Tandai quest selesai
        progress.is_completed = True
        progress.completed_at = datetime.now(timezone.utc)
        if progress.current_count < quest.target_count:
            progress.current_count = quest.target_count

        # Berikan XP sesuai reward quest
        new_xp, new_lvl, lvl_up = self.add_xp(
            db,
            user_id=user.id,
            amount=quest.xp_reward,
            source="quest_complete",
            description=f"Penyelesaian Quest: {quest.title}"
        )

        db.commit()

        # Cek pencapaian baru yang terbuka
        unlocked = self._check_and_unlock_achievements(db, user)

        return CompleteQuestResponse(
            success=True,
            message=f"Selamat! Quest '{quest.title}' berhasil diselesaikan.",
            quest_id=quest_id,
            xp_awarded=quest.xp_reward,
            new_total_xp=new_xp,
            level=new_lvl,
            level_up=lvl_up,
            new_achievements=unlocked
        )

    def award_chat_xp(
        self,
        db: Session,
        user_id: int,
        status: str,
        match_method: Optional[str] = None,
        score: Optional[float] = None
    ) -> Tuple[int, bool, int, int]:
        """
        Memberikan reward XP terukur berdasarkan keberhasilan algoritma NLP (Langkah 4 & 5):
        - Cosine Similarity tinggi (>= 0.70): +15 XP
        - Cosine Similarity standar (0.35 - 0.69): +10 XP
        - Fuzzy Matching toleransi typo (>= 75.0): +10 XP
        - Status no_answer: 0 XP
        Proteksi Anti-Spam: Maksimal 10 query yang mendapatkan direct XP per hari per pengguna.
        Mengembalikan: (xp_earned, level_up, new_total_xp, current_level)
        """
        user = self.get_user(db, user_id)
        if status != "answer_found":
            return 0, False, user.total_xp, user.level

        # Hitung transaksi chat_query hari ini untuk pembatasan anti-spam
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        today_tx_count = db.query(XPTransaction).filter(
            XPTransaction.user_id == user.id,
            XPTransaction.source == "chat_query",
            XPTransaction.created_at >= today_start
        ).count()

        if today_tx_count >= 10:
            # Batas harian tercapai
            return 0, False, user.total_xp, user.level

        # Tentukan XP berdasarkan metode pencocokan dan nilai skor
        if match_method == "cosine_similarity" and score is not None and score >= 0.70:
            xp_amount = 15
            desc = f"Aktivitas Chatbot: Jawaban Presisi Tinggi Cosine ({score:.4f})"
        elif match_method == "cosine_similarity":
            score_str = f"{score:.4f}" if score is not None else ">=0.35"
            xp_amount = 10
            desc = f"Aktivitas Chatbot: FAQ Terjawab Cosine ({score_str})"
        elif match_method == "fuzzy_matching":
            score_str = f"{score:.1f}%" if score is not None else ">=75%"
            xp_amount = 10
            desc = f"Aktivitas Chatbot: Penelusuran Fuzzy Saltik ({score_str})"
        else:
            xp_amount = 10
            desc = "Aktivitas Chatbot: Pertanyaan Akademik Terjawab"

        new_total_xp, new_level, level_up = self.add_xp(
            db=db,
            user_id=user.id,
            amount=xp_amount,
            source="chat_query",
            description=desc
        )

        return xp_amount, level_up, new_total_xp, new_level

    def record_chat_activity(
        self,
        db: Session,
        user_id: int,
        question: str,
        match_method: Optional[str] = None,
        score: Optional[float] = None,
        status: str = "answer_found"
    ) -> None:
        """Memperbarui progres quest harian dan mengevaluasi pencapaian terkait hasil algoritma."""
        user = self.get_user(db, user_id)
        today = date.today()

        # 1. Update quest_first_faq
        p1 = db.query(QuestProgress).filter(
            QuestProgress.user_id == user.id,
            QuestProgress.quest_id == "quest_first_faq",
            QuestProgress.quest_date == today
        ).first()
        if p1 and not p1.is_completed:
            p1.current_count += 1
            if p1.current_count >= 1:
                p1.current_count = 1

        # 2. Check keywords for curriculum quest (krs, sks, cuti, kuliah, semester)
        q_lower = question.lower()
        if any(w in q_lower for w in ["cuti", "krs", "sks", "kurikulum", "semester"]):
            p2 = db.query(QuestProgress).filter(
                QuestProgress.user_id == user.id,
                QuestProgress.quest_id == "quest_curriculum",
                QuestProgress.quest_date == today
            ).first()
            if p2 and not p2.is_completed:
                p2.current_count += 1

        db.commit()

        # Evaluasi pencapaian terkait chat (first question, curious mind, cosine expert, fuzzy explorer)
        self._check_and_unlock_achievements(db, user)

    def get_leaderboard(self, db: Session, limit: int = 10) -> LeaderboardResponse:
        users = db.query(User).order_by(User.total_xp.desc()).limit(limit).all()
        items = []
        for idx, u in enumerate(users, start=1):
            lvl, title, _, _, _, _ = self._calculate_level_info(db, u.total_xp)
            items.append(LeaderboardItem(
                rank=idx,
                user_id=u.id,
                username=u.username,
                full_name=u.full_name,
                level=lvl,
                level_title=title,
                total_xp=u.total_xp
            ))
        total_users = db.query(User).count()
        return LeaderboardResponse(total_users=total_users, leaderboard=items)

gamification_service = GamificationService()
