from enum import Enum

class TaskStatus(str, Enum):
    Pendente = "pending"
    Em_Andamento = "in_progress"
    Concluida = "completed"
    Falhou = "failed"
    
    # under_review = "Aguardando Revisão"
    # on_hold = "Em Espera"
    # canceled = "Cancelada"
    # reopened = "Reaberta"
    # delayed = "Atrasada"