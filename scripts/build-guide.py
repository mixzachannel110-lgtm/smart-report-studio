"""Build the browser-readable, printable manual using only the Python standard library."""
from pathlib import Path
from html import escape
import re
root=Path(__file__).resolve().parents[1]
source=(root/'docs/USER-GUIDE.md').read_text()
def inline(s):
    s=escape(s)
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:'<a href=\"'+('workflow-test-report.html' if m[2]=='WORKFLOW-TEST-REPORT.md' else escape(m[2],quote=True))+'\">'+m[1]+'</a>',s)
    return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',s)
parts=[];toc=[];paragraph=[];lst=None;table=False;fenced=False;code=[]
def flush():
    if paragraph:
        parts.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
def close_list():
    global lst
    if lst:parts.append('</'+lst+'>');lst=None
for line in source.splitlines():
    if line.startswith('```'):
        flush();close_list()
        if fenced:parts.append('<pre><code>'+escape('\n'.join(code))+'</code></pre>');code=[]
        fenced=not fenced;continue
    if fenced:code.append(line);continue
    if not line.strip():
        flush();close_list()
        if table:parts.append('</tbody></table></div>');table=False
        continue
    if line=='<!-- TEMPLATE_COVERS -->':
        parts.append('<div class="covers"><figure><img src="assets/templates/pm151/original-cover.png" alt="ปกต้นฉบับครัวการบิน"><figcaption>ต้นฉบับ PM.FP.69-151 · 56 หน้า</figcaption></figure><figure><img src="assets/templates/pt095/original-cover.png" alt="ปกต้นฉบับ AGC"><figcaption>ต้นฉบับ PM.FP.69-095 · 44 หน้า</figcaption></figure></div>');continue
    img_match=re.match(r'^!\[(.*?)\]\((.*?)\)$', line.strip())
    if img_match:
        flush();close_list()
        cap, src = img_match.group(1), img_match.group(2)
        parts.append(f'<figure style="margin:22px 0;text-align:center"><img src="{src}" alt="{escape(cap)}" style="width:100%;max-width:850px;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,0.08);border:1px solid var(--line)"><figcaption style="font-size:12px;color:#607a93;margin-top:8px">{escape(cap)}</figcaption></figure>')
        continue
    h=re.match(r'^(#{1,3}) (.+)',line)
    if h:
        flush();close_list();level=len(h[1]);title=h[2];anchor='section-'+str(len(toc)+1) if level==2 else ''
        if level==2:toc.append((anchor,title))
        parts.append(f'<h{level}'+(f' id="{anchor}"' if anchor else '')+'>'+inline(title)+f'</h{level}>');continue
    if line.startswith('|'):
        flush();close_list();cells=[c.strip() for c in line.strip('|').split('|')]
        if all(re.fullmatch(r':?-+:?',c) for c in cells):continue
        if not table:
            parts.append('<div class="table"><table><thead><tr>'+''.join('<th>'+inline(c)+'</th>' for c in cells)+'</tr></thead><tbody>');table=True
        else:parts.append('<tr>'+''.join('<td>'+inline(c)+'</td>' for c in cells)+'</tr>')
        continue
    item=re.match(r'^(\d+\. |\- )(.+)',line)
    if item:
        flush();kind='ul' if item[1].startswith('-') else 'ol'
        if lst!=kind:close_list();parts.append('<'+kind+'>');lst=kind
        parts.append('<li>'+inline(item[2])+'</li>');continue
    paragraph.append(line)
flush();close_list()
css='''
:root{--ink:#20354d;--blue:#2469a8;--line:#dfe7ef}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:25px}body{margin:0;background:#f3f6fa;color:var(--ink);font:16px/1.9 system-ui,-apple-system,"Thonburi",sans-serif}header{background:#17345c;color:white;padding:24px max(24px,calc((100% - 1180px)/2));display:flex;justify-content:space-between;align-items:center;gap:15px}header b{font-size:18px}header small{display:block;color:#b6cbe0}a{color:var(--blue)}header a,header button{font:inherit;font-size:13px;color:white;background:#ffffff13;border:1px solid #ffffff44;border-radius:8px;padding:9px 14px;text-decoration:none;cursor:pointer}header .buttons{display:flex;gap:10px;flex-wrap:wrap}.layout{max-width:1180px;margin:30px auto;display:grid;grid-template-columns:255px minmax(0,1fr);gap:28px;padding:0 20px}aside{position:sticky;top:20px;align-self:start;max-height:calc(100vh - 40px);overflow:auto;padding:18px;background:white;border:1px solid var(--line);border-radius:12px}aside b{font-size:14px}aside a{display:block;font-size:12px;text-decoration:none;line-height:1.6;margin-top:12px;color:#54718c}aside a:hover{text-decoration:underline}article{background:white;border:1px solid var(--line);border-radius:12px;padding:34px;min-width:0}h1{font-size:29px;line-height:1.5;color:#17345c;margin:0 0 15px}h2{font-size:22px;line-height:1.6;border-top:1px solid var(--line);padding-top:26px;margin-top:35px;color:#17345c}h3{font-size:18px}p{margin:15px 0}li{padding-left:4px;margin:8px 0}ul,ol{padding-left:26px}.table{overflow:auto;margin:20px 0}table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.8}th,td{border:1px solid var(--line);padding:11px 13px;text-align:left;vertical-align:top}th{background:#edf4fb;color:#17345c}td:first-child{min-width:135px}pre{padding:20px;background:#142e4e;color:#e2efff;border-radius:8px;overflow:auto;font:12px/1.9 ui-monospace,monospace}.covers{display:flex;justify-content:center;gap:24px;margin:30px 0}.covers figure{margin:0;text-align:center}.covers img{width:100%;max-width:190px;box-shadow:0 3px 12px #18344e26}.covers figcaption{font-size:11px;color:#607a93;margin-top:12px}footer{text-align:center;color:#8393a4;font-size:12px;padding:0 20px 30px}@media(max-width:850px){.layout{grid-template-columns:1fr}aside{position:static;max-height:230px}article{padding:24px}header{padding:18px;flex-wrap:wrap}h1{font-size:24px}}@media print{@page{size:A4;margin:17mm}body{font-size:11pt;background:white;color:black;line-height:1.7}header,aside,footer{display:none}.layout{display:block;margin:0;padding:0;max-width:none}article{border:0;padding:0;border-radius:0}h1{font-size:22pt}h2{font-size:16pt;break-after:avoid;page-break-after:avoid;padding-top:14pt;margin-top:22pt}h3{break-after:avoid;page-break-after:avoid}table{font-size:9pt}.table{overflow:visible}thead{display:table-header-group}tr,figure,pre{break-inside:avoid}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:9pt;border:1px solid #ccc;background:#f5f5f5;color:#111}.covers img{max-width:135px}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
'''
html='<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>คู่มือใช้งาน IDC Smart Report Studio</title><style>'+css+'</style></head><body><header><div><b>IDC Smart Report Studio</b><small>คู่มือใช้งานภาษาไทย · รุ่นต้นแบบ 0.1</small></div><div class="buttons"><a href="index.html">เปิดเว็บแอป</a><button onclick="window.print()">พิมพ์ / บันทึกคู่มือเป็น PDF</button></div></header><div class="layout"><aside><b>สารบัญ</b>'+''.join(f'<a href="#{anchor}">{escape(title)}</a>' for anchor,title in toc)+'</aside><article>'+''.join(parts)+'</article></div><footer>คู่มือรุ่นต้นแบบ · 31 ตุลาคม 2569 · ข้อมูลในคู่มือตรงกับฟังก์ชันที่มีอยู่ในรุ่นนี้</footer></body></html>'
(root/'dist/user-guide.html').write_text(html)
print(f'Generated user-guide.html with {len(toc)} sections')
