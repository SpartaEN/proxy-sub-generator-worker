import base64
import json

blacklisted_wordlist = ["白嫖", "试用", "剩余流量", "备用官网", "认准官网",
                        "加入用户群", "校园", "因V2ray重大漏洞", "没有单端口节点"]

whitelisted_wordlist = ["沪日IEPL", "沪日IPLC", "ソフトバンク", "auひかり"]

wordlist_encoded = []

for word in blacklisted_wordlist:
    wordlist_encoded.append(base64.b64encode(word.encode()).decode('utf-8'))

print(json.dumps(wordlist_encoded))

wordlist_encoded = []

for word in whitelisted_wordlist:
    wordlist_encoded.append(base64.b64encode(word.encode()).decode('utf-8'))
