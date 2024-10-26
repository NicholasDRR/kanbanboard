from enum import Enum

class TaskPriority(str, Enum):
    Low = "low"
    Medium = "medium"
    High = "high"