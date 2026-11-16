from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    full_name: str
    email: str
    total_xp: int
    level: int
    level_title: str
    badge_icon: str
    current_streak: int
    current_level_min_xp: int
    next_level_min_xp: int
    xp_needed_for_next_level: int
    progress_percentage: float
    unlocked_achievements_count: int


class ProgressResponse(BaseModel):
    user_id: int
    level: int
    level_title: str
    badge_icon: str
    total_xp: int
    current_level_min_xp: int
    next_level_min_xp: int
    current_xp_in_level: int
    xp_needed_for_next_level: int
    progress_percentage: float
    daily_quests_completed: int
    daily_quests_total: int
    achievements_unlocked: int
    achievements_total: int


class AchievementItem(BaseModel):
    id: str
    code: str
    title: str
    description: str
    badge_icon: str
    xp_reward: int
    category: str
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None


class AchievementsResponse(BaseModel):
    total_unlocked: int
    total_available: int
    achievements: List[AchievementItem]


class QuestItem(BaseModel):
    id: str
    title: str
    description: str
    target_count: int
    current_count: int
    xp_reward: int
    category: str
    is_completed: bool
    can_complete: bool


class QuestsResponse(BaseModel):
    date: str
    completed_count: int
    total_quests: int
    quests: List[QuestItem]


class CompleteQuestResponse(BaseModel):
    success: bool
    message: str
    quest_id: str
    xp_awarded: int
    new_total_xp: int
    level: int
    level_up: bool
    new_achievements: List[str]


class LeaderboardItem(BaseModel):
    rank: int
    user_id: int
    username: str
    full_name: str
    level: int
    level_title: str
    total_xp: int


class LeaderboardResponse(BaseModel):
    total_users: int
    leaderboard: List[LeaderboardItem]
