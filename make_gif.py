import base64, json, io
from PIL import Image

with open(r'C:\Users\shiguanyu\AppData\Local\Doubao\User Data\Default\.doubao\agent_mode\workspace\.sessions\38448970665792514\agents\m_0cwRPsWF3LW\system\tool-results\execute_defer_tool_9a850e6fec0a.txt','r',encoding='utf-8') as f:
    txt = f.read()

start = txt.index('[')
# 找匹配的 ]
depth = 0
for i, ch in enumerate(txt[start:], start):
    if ch == '[': depth += 1
    elif ch == ']':
        depth -= 1
        if depth == 0:
            end = i+1
            break
data = json.loads(txt[start:end])

imgs = []
for b in data:
    im = Image.open(io.BytesIO(base64.b64decode(b))).convert('RGB')
    imgs.append(im)

imgs[0].save(r'C:\AI\prototypes\dsh-agents-nodes\demo.gif',
    save_all=True, append_images=imgs[1:], duration=450, loop=0, optimize=True)
print('gif saved, frames:', len(imgs))
