import json
import requests
import datetime


# def unique_tags(tags):
#     result = list(set([x for x in tags.get('tags', []) if isinstance(x, str)]))
#     return result


# requests.Response()


# data = """{
#     "title": "Кривые баги 1: Империя приносит баги",
#     "description": "Балбл",
#     "tags": [2, "семейное кино", "космос", 1.0, "сага", "эписк", "ава", true, "авав", "deug", "dfdf", "dfdf", 5, 3],
#     "version": 12
# }"""

# 'ddd dddd'.startswith

# result = unique_tags(json.loads(data))
print(datetime.datetime.strftime(
        datetime.datetime.utcnow() + datetime.timedelta(seconds=50),
        "%a, %d-%b-%Y %H:%M:%S GMT",
    ))