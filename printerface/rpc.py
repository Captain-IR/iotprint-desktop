import xmlrpc.client
import json

rpc = xmlrpc.client.ServerProxy('http://localhost:7978')
data = rpc.status()

print(json.dumps(data))