from enum import Enum

class TaskStatus(str, Enum):
    Backlog = "backlog"
    Doing = "doing"
    Review = "review"
    Done = "done"
    
    # under_review = "Aguardando Revisão"
    # on_hold = "Em Espera"
    # canceled = "Cancelada"
    # reopened = "Reaberta"
    # delayed = "Atrasada"