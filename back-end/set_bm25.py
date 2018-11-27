""" Calculate a IR system which is based on BM25.

Example usage:
    python bm25.py

"""

import math
import time
import json
import jieba
from tqdm import tqdm
jieba.dt.cache_file = 'jieba.cache.new'
jieba.load_userdict('../data/userdict.txt')

from typing import List, Set

class BM25():
    """ A BM25 IR system."""
    def __init__(self, docs=None, import_data=None, json_name=None):
        if import_data:
            self.__dict__ = import_data
        else:
            self.D = len(docs)
            self.avgdl = sum([len(doc)+0.0 for doc in docs]) / self.D
            self.docs = docs
            self.f = []  # 列表的每一个元素是一个dict，dict存储着一个文档中每个词的出现次数
            self.df = {} # 存储每个词及出现了该词的文档数量
            self.idf = {} # 存储每个词的idf值
            self.k1 = 1.5
            self.b = 0.75
            self.inv_file = {}

    def init(self):
        """ Calculate f, df, idf. """
        print('Start calculating f, df.')
        for index, doc in enumerate(tqdm(self.docs)):
            tmp = {}
            for word in doc:
                tmp[word] = tmp.get(word, 0) + 1  # 存储每个文档中每个词的出现次数
            self.f.append(tmp)
            for k in tmp.keys():
                self.df[k] = self.df.get(k, 0) + 1
                if k in self.inv_file:
                    self.inv_file[k] += [index]
                else:
                    self.inv_file[k] = [index]

        print('Start calculating idf.')
        for k, v in tqdm(self.df.items()):
            self.idf[k] = math.log(self.D-v+0.5)-math.log(v+0.5)

    def sim(self, word_list_list: List[List[str]], index):
        """ Calculate score. """
        score = 0
        d = len(self.docs[index])
        for word_list in word_list_list:
            for word in word_list:
                if word in self.f[index]:
                    score += (self.idf[word]*self.f[index][word]*(self.k1+1)/ (self.f[index][word]+self.k1*(1-self.b+self.b*d/ self.avgdl)))
        return score

    def union(self, query_seg) -> Set[int]:
        key_doc = []
        for term in query_seg:
            if term in self.inv_file:
                key_doc += self.inv_file[term]
        return set(key_doc)

    def intersec(self, all_union_set: List[Set[int]]) -> Set[int]:
        intersec_set = all_union_set[0]
        for union_set in all_union_set[1:]:
            intersec_set &= union_set
        return intersec_set

    def sim_all(self, query_seg: List[List[str]], optional: List[str]):
        """ Calculate a list of score given a list of docs. """
        scores = [0] * self.D

        all_union_set = []
        for keyword_set in query_seg:
            union_set = self.union(keyword_set)
            all_union_set += [union_set]

        intersec_set = self.intersec(all_union_set)
        print('TOTAL INTERSEC:', len(intersec_set))
        for index in intersec_set:
            scores[index] = self.sim(query_seg + [optional], index)
        return scores

    def export_json(self, json_name):
        """ Export this class into json file. """
        with open(json_name, 'w') as outfile:
            json.dump(self.__dict__, outfile)

def main(dev=False):
    """ Main function. """
    start = time.time()

    if dev:
        with open('../../../data/dev/sample_content.json') as infile:
            content_list = json.load(infile)
    else:
        with open('../../../data/contents/ltn_contents.json') as infile:
            content_list = json.load(infile)
    print('Time {}: Finish loading json file.'.format(time.time() - start))

    seg_content_list = [jieba.lcut(content['content']) for content in content_list]
    print('Time {}: Finish segmenting contents.'.format(time.time() - start))

    ir_system = BM25(docs=seg_content_list)
    ir_system.init()
    print('Time {}: Finish calculating f, df, and idfs.'.format(time.time() - start))

    if dev:
        ir_system.export_json('../../../data/dev/union_sample_bm25_system.json')
    else:
        ir_system.export_json('../../../data/bm25_system/dict_ltn_bm25_system.json')
    print('Time {}: finish all.'.format(time.time() - start))

if __name__ == '__main__':
    main(dev=False)
