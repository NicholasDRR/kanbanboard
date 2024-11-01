def convert_task_document(task):
    task['_id'] = str(task['_id']) 
    return task