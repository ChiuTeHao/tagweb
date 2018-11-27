import datetime
import math
import json
import time

from gevent import monkey
monkey.patch_all()
from bottle import run, response, request, static_file
import bottle.ext.sqlite

from set_query import Bm25_query
###from sa import Sa_aip

HOST = '140.112.31.149' # IRlab
PORT = 5005

WANT_CNT = 30

# DB

DBFILE = '../../../data/dbfile/dev.db'
app = bottle.Bottle()
plugin = bottle.ext.sqlite.Plugin(dbfile=DBFILE)
app.install(plugin)

# UTIL

def get_labeler_id_by_name(db, labeler_name):
    rows = db.execute('SELECT * FROM labeler'
                      ' WHERE name=?', (labeler_name,))
    for row in rows:
        idx = row['id']
        return idx
    return -1

def get_topic_id_by_topic(db, topic):
    rows = db.execute('SELECT * FROM topics'
                      ' WHERE topic=?', (topic,))
    for row in rows:
        idx = row['id']
        return idx
    return -1

def get_label_rec(db, labeler_id, topic_id, url):
    rows = db.execute('SELECT * FROM label_rec'
                      ' WHERE labeler_id=? AND topic_id=? AND url=?'
                      ' ORDER BY timestamp DESC LIMIT 1', (labeler_id, topic_id, url))
    for row in rows:
        relev = row['relev']
        stance = row['stance']
        do_later = (row['do_later'] == 1)
        suggest_remove = (row['suggest_remove'] == 1)

        label_status = 1 # 2: done, 1: to do, 0: empty
        if (relev != -1 and stance != 999) or relev == 0:
            label_status = 2
        if relev == -1 and stance == 999:
            label_status = 0
        if do_later or suggest_remove:
            label_status = 1

        return {
            'status': True,
            'labelStatus': label_status,
            'relev': str(relev),
            'stance': str(stance),
            'doLater': do_later,
            'suggestRemove': suggest_remove,
            'timestamp': row['timestamp'],
        }
    return {
        'status': False,
    }

# GET

@app.get('/api/labelers')
def process(db):
    print('GET /api/labelers')

    rows = db.execute('SELECT * FROM labeler')
    name_list = []
    for row in rows:
        name_list += [row['name']]

    response.content_type = 'application/json'
    return json.dumps(name_list)

@app.get('/api/topics')
def process(db):
    print('GET /api/topics')

    rows = db.execute('SELECT * FROM topics')
    topic_list = []
    for row in rows:
        topic_list += [{
            'topic': row['topic'],
            'queryText': row['query_text'],
        }]

    response.content_type = 'application/json'
    return json.dumps(topic_list)

# POST

@app.post('/api/register')
def process(db):
    req_body = request.body.read().decode()
    postdata = json.loads(req_body)

    name = postdata['name']

    print('POST /api/register with name: {}'.format(name))

    labeler_id = get_labeler_id_by_name(db, name)
    if labeler_id != -1:
        return json.dumps({
            'status': False,
            'message': 'This name has been registered before.',
        })

    if not name.strip():
        return json.dumps({
            'status': False,
            'message': 'This name\'s format is not valid.',
        })

    rows = db.execute('INSERT INTO labeler (name)'
                      ' VALUES (?)', (name,))

    response.content_type = 'application/json'
    return json.dumps({
        'status': True,
        'message': 'Register successfully. Now you can login.',
    })

@app.post('/api/login')
def process(db):
    req_body = request.body.read().decode()
    postdata = json.loads(req_body)

    name = postdata['name']

    print('POST /api/login with name: {}'.format(name))

    labeler_id = get_labeler_id_by_name(db, name)
    if labeler_id == -1:
        return json.dumps({
            'status': False,
            'message': 'This name does not exist in database.',
        })

    response.content_type = 'application/json'
    return json.dumps({
        'status': True,
        'message': 'Login successfully.',
    })

@app.post('/api/add_label')
def process(db):
    req_body = request.body.read().decode()
    postdata = json.loads(req_body)

    name = postdata['name']
    topic = postdata['topic']
    url = postdata['url']
    post_label = postdata['label']
    print(post_label)

    relev = post_label['relev']
    stance = post_label['stance']
    do_later = post_label['doLater']
    suggest_remove = post_label['suggestRemove']
    time_str = str(datetime.datetime.fromtimestamp(time.time()))

    print('POST /api/add_label with'
            ' name: {}, topic: {}, url: {}, relev: {}, stance: {},'
            ' do_later: {}, suggest_remove: {}'.format(
              name, topic, url, relev, stance, do_later, suggest_remove
          ))

    labeler_id = get_labeler_id_by_name(db, name)
    if labeler_id == -1:
        return json.dumps({
            'status': False,
            'message': 'Labeler\'s name does not exist in database!',
        })

    topic_id = get_topic_id_by_topic(db, topic)
    if topic_id == -1:
        return json.dumps({
            'status': False,
            'message': 'This topic does not exist in database!',
        })

    db.execute('INSERT INTO label_rec '
               '(labeler_id, topic_id, url, stance, relev, do_later, suggest_remove, timestamp)'
               ' VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
               (labeler_id, topic_id, url, stance, relev, do_later, suggest_remove, time_str))

    response.content_type = 'application/json'
    return json.dumps(get_label_rec(db, labeler_id, topic_id, url))

@app.post('/api/bm25_topic')
def process(db):
    req_body = request.body.read().decode()
    postdata = json.loads(req_body)

    name = postdata['name']
    topic = postdata['topic']
    query_list = postdata['queryList']
    want_rank = postdata['wantRank']

    print('name:{}, topic: {}, query_list: {}, want_rank: {}'.format(
        name, topic, query_list, want_rank
    ))

    beg_rank = want_rank
    beg_rank = 0 if beg_rank < 0 else beg_rank

    # check labeler and topic
    labeler_id = get_labeler_id_by_name(db, name)
    topic_id = get_topic_id_by_topic(db, topic)
    if labeler_id == -1 or topic_id == -1:
        return {
            'status': False,
        }

    # simulate
    start = time.time()
    query_seg_list, score_list, rank_list = bm25_query.query(query_list, topic_set_list[topic_id - 1]['optional'])
    use_time = time.time() - start
    print('Spending {} seconds to calculate result.'.format(use_time))

    # generate res_list
    res_list = []
    for i, content_id in enumerate(rank_list[beg_rank: beg_rank + WANT_CNT]):
        label = get_label_rec(db, labeler_id, topic_id, contents[content_id]['url'])
        res_list += [dict(
            contents[content_id],
            rank_id=beg_rank+i,
            score=score_list[content_id],
            label=label,
            sa_score=1
        )]

    # cnt = 0
    # res_list = []
    # for i, content_id in enumerate(rank_list[beg_rank: beg_rank + 300]):
    #     if cnt >= WANT_CNT:
    #         break
    #     label = get_label_rec(db, labeler_id, topic_id, contents[content_id]['url'])
    #     if (is_label and label['status']) or (not is_label and not label['status']):
    #         res_list += [dict(
    #             contents[content_id],
    #             rank_id=beg_rank+i,
    #             score=score_list[content_id],
    #             label=label,
    #             sa_score=1
    #         )]
    #         cnt += 1

    # nonzero_cnt = sum(score > 0 for score in score_list)
    # TODO
    nonzero_cnt = sum(score != 0 for score in score_list)

    tot_page = len(rank_list)

    # sa_list = sa_aip.sa_for_title([ret['title'] for ret in res_list])
    # sa_list = [1] * len(res_list)

    # for i, sa_ in enumerate(sa_list):
    #     res_list[i]['sa_score'] = sa_

    response.content_type = 'application/json'
    return json.dumps({
        'status': True,
        'resultList': res_list,
        'querySegList': query_seg_list,
        'totRank': nonzero_cnt,
        'totPage': tot_page,
        'useTime': use_time,
    })

@app.post('/api/bm25')
def process(db):
    req_body = request.body.read().decode()
    postdata = json.loads(req_body)

    name = postdata['name']
    topic = postdata['topic']
    want_rank = postdata['wantRank']
    # is_label = postdata['isLabel']

    print('name:{}, topic: {}, want_rank: {}'.format(
        name, topic, want_rank
    ))

    beg_rank = want_rank
    beg_rank = 0 if beg_rank < 0 else beg_rank

    # check labeler and topic
    labeler_id = get_labeler_id_by_name(db, name)
    topic_id = get_topic_id_by_topic(db, topic)
    if labeler_id == -1 or topic_id == -1:
        return {
            'status': False,
        }

    keyword_set_list = topic_set_list[topic_id - 1]['set']
    keyword_set_str_list = []
    for keyword_set in keyword_set_list:
        keyword_set_str_list += [' '.join(keyword_set)]

    # simulate
    start = time.time()
    query_seg_list, score_list, rank_list = bm25_query.query(keyword_set_str_list, topic_set_list[topic_id - 1]['optional'])
    use_time = time.time() - start
    print('Spending {} seconds to calculate result.'.format(use_time))

    # generate res_list
    res_list = []
    for i, content_id in enumerate(rank_list[beg_rank: beg_rank + WANT_CNT]):
        label = get_label_rec(db, labeler_id, topic_id, contents[content_id]['url'])
        res_list += [dict(
            contents[content_id],
            rank_id=beg_rank+i,
            score=score_list[content_id],
            label=label,
            sa_score=1
        )]

    # cnt = 0
    # res_list = []
    # for i, content_id in enumerate(rank_list[beg_rank: beg_rank + 300]):
    #     if cnt >= WANT_CNT:
    #         break
    #     label = get_label_rec(db, labeler_id, topic_id, contents[content_id]['url'])
    #     if (is_label and label['status']) or (not is_label and not label['status']):
    #         res_list += [dict(
    #             contents[content_id],
    #             rank_id=beg_rank+i,
    #             score=score_list[content_id],
    #             label=label,
    #             sa_score=1
    #         )]
    #         cnt += 1

    # nonzero_cnt = sum(score > 0 for score in score_list)
    # TODO
    nonzero_cnt = sum(score != 0 for score in score_list)

    tot_page = len(rank_list)

    # sa_list = sa_aip.sa_for_title([ret['title'] for ret in res_list])
    # sa_list = [1] * len(res_list)

    # for i, sa_ in enumerate(sa_list):
    #     res_list[i]['sa_score'] = sa_

    response.content_type = 'application/json'
    return json.dumps({
        'status': True,
        'resultList': res_list,
        'querySegList': query_seg_list,
        'totRank': nonzero_cnt,
        'totPage': tot_page,
        'useTime': use_time,
    })

# STATIC

@app.get('/')
@app.get('/<path:path>')
def callback(path='index.html'):
    return static_file(path, ('/home/guest/b04902053/desktop'
                              '/front-end/set_dev/build'))

# MAIN

if __name__ == '__main__':
    dev = True
    if dev:
        file_list = {
            'contents':  '../data/dev/sample_content.json',
            'bm_system': '../data/dev/union_sample_bm25_system.json',
        }
    else:
        file_list = {
            'contents':  '../../../data/contents/appledaily_contents.json',
            'bm_system': '../../../data/bm25_system/union_appledaily_bm25_system.json',
        }
    topic_set_json = '../data/topic.json'

    with open(topic_set_json) as infile:
        topic_set_list = json.load(infile)

    start = time.time()
    with open(file_list['contents'], 'r') as infile:
        contents = json.load(infile)
    with open(file_list['bm_system'], 'r') as infile:
        bm_system = json.load(infile)
    bm25_query = Bm25_query(contents, bm_system)
    print('Spending {} seconds to load files.'.format(time.time() - start))

    # sa_aip = Sa_aip()
    # run(host=HOST, port=PORT, server='tornado', debug=True)
    run(app, host=HOST, port=PORT, server='gevent', debug=True)
