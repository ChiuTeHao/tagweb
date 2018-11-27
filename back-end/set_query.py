import json
import pickle
import time
from typing import List

import jieba
jieba.dt.cache_file = 'jieba.cache.new'
jieba.load_userdict('../data/userdict.txt')
from set_bm25 import BM25  #if you want to unpickle a object, but the class definition is at other file, you should import this!

class Bm25_query:
    def __init__(self, contents, bm_system):
        self.contents = contents
        self.bm25 = BM25(import_data=bm_system)

    def query(self, keyword_set_str_list: List[str], optional: List[str]):
        keyword_set_list = []
        for keyword_set_str in keyword_set_str_list:
            keyword_set = list(jieba.cut(keyword_set_str))
            keyword_set = [x for x in keyword_set if x != ' '] # remove ' ' such like 台大 管中閔 -> ['台大',' ','管中閔']
            keyword_set_list += [keyword_set]
            # TODO: Handle english convert case, eg. google -> Google

        beg_time = time.time()
        score_list = self.bm25.sim_all(keyword_set_list, optional)
        end_time = time.time()
        print('{} seconds for computing.'.format(end_time - beg_time))

        beg_time = time.time()
        rank_list = sorted(range(len(score_list)), key=lambda k: score_list[k], reverse=True)  #get the rank index of doc
        end_time = time.time()
        print('{} seconds for sorting.'.format(end_time - beg_time))

        return keyword_set_list, score_list, rank_list

def main(dev=True):
    if dev:
        file_list = {
            'contents':  '../../../data/dev/sample_content.json',
            'bm_system': '../../../data/dev/union_sample_bm25_system.json',
        }
    else:
        file_list = {
            'contents':  '../../../data/udn_contents.json',
            'bm_system': '../../../data/union_bm25_system.json',
        }

    with open(file_list['contents'], 'r') as infile:
        contents = json.load(infile)
    with open(file_list['bm_system'], 'r') as infile:
        bm_system = json.load(infile)
    bm25_query = Bm25_query(contents, bm_system)

    query_list = [
        '管中閔當台大校長',
        '使用環保吸管',
        '台人追求「小確幸」',
        'iPhone XS',
        '廢死',
        '廢除研發替代役',
        '英文列為第二官方語言',
        '禁行機車道是否應該存在。',
        '是否要開放重機上高速公路',
        '超車道是否能夠在沒有超車需求的狀況下，持續以最高速行駛',
        '進口車輛是否應減免關稅。',
        '油價是否要凍漲',
        '人民檢舉交通違規是否需要受理',
        '晚上10:00之後，紅線是否可以停車',
        '同性婚姻',
        '正名「台灣」參與國際級運動賽事',
        '廢棄核能發電',
        '騎電動車需要機車駕照',
        '提高酒駕罰則',
        '人類安樂死合法化',
        '是否限制取得中國居留證的我國公民參政權',
        '是否開放日本核災地區生產的食品',
        '深澳電廠是否要擴建',
        '連假期間，國道是否要開放免收費時段',
        'Uber是否應該配合臺灣法律（採職業駕駛、繳稅等）',
        'Etag是否可用於舉發超速',
        '中油觀塘第三天然氣接收站取代深奧電廠',
        '動物園是否該存在',
        '代理孕母',
    ]

    for query in query_list:
        print(query)
        query_seg, tot_page, ret_list = bm25_query.query(query, 0, 10)
        print('===============================================')

if __name__ == '__main__':
    main(dev=True)
