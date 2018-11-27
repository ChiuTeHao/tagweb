import React from 'react'
import PropTypes from 'prop-types'
import Highlighter from 'react-highlight-words'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'

import Variables from './Variables.js'
import Label from './Label.js'

import './Content.css'

const Content = (props) => {
  const senti = {
    0: {
      name: 'negative',
      color: '#ff8a65',
    },
    1: {
      name: 'neutral',
      color: '#fff176',
    },
    2: {
      name: 'positive',
      color: '#aed581',
    },
  }

  const {
    topic, isShow, hideContent,
    showIdx, querySegList, res,
    nextContent, prevContent
  } = props

  let highlightWords = []
  for (let segId in querySegList) {
    highlightWords = highlightWords.concat(querySegList[segId])
  }

  const wantCnt = Variables.wantCnt

  if (res && isShow) {
    let stance = ''
    switch (res.label.stance) {
      case '1':
      case 1:
        stance = 'For'
        break
      case '0':
      case 0:
        stance = 'Observing'
        break
      case '-1':
      case -1:
        stance = 'Against'
        break
      default:
        stance = 'No Record.'
    }

    return (
      <div id="content" onClick={ hideContent }>
        {showIdx === 0? null : (
          <div id="content-prev" onClick={prevContent}>
            <SkipPreviousIcon style={{ fontSize: '1.5em' }} />
            <p>(<u>←</u>)</p>
          </div>
        )}
        <div className="inside card">
          <p style={{ textAlign: 'center', margin: '0 0 1em 0', lineHeight: '2em' }}>
            Computed Scores:
          </p>
          <div className="score">
            <div className="inside-score">
              <span>Rank: </span>
              <span className="score-num">{ res.rank_id + 1 }</span>
            </div>
            <div className="inside-score">
              <span>Relevant: </span>
              <span className="score-num">{ res.score.toFixed(3) }</span>
            </div>
            <div className="inside-score">
              <span>Stance: </span>
              <span className="score-num">
                { senti[res.sa_score].name }
              </span>
            </div>
          </div>
          <h2 className="title">
            <Highlighter
              highlightClassName="highlight-text"
              searchWords={highlightWords}
              autoEscape={true}
              textToHighlight={res.title}
            />
          </h2>
          <div className="author">
            <span style={{margin: '0 2em'}}>{ res.author === '-----'? '自由時報' : res.author }</span>
            <span>{ res.date }</span>
          </div>
          <div className="url">
            <span>( </span>
            <a href={ res.url } rel='noopener noreferrer' target="_blank">
              { res.url }
            </a>
            <span> )</span>
          </div>
          <div className="content">
            {res.content.split(/\r?\n/).map((con, id) =>
              <p key={ id }>
                <Highlighter
                  highlightClassName="highlight-text"
                  searchWords={highlightWords}
                  autoEscape={ true }
                  textToHighlight={ con }
                />
              </p>
            )}
          </div>
        </div>
        <div className="inside-2">
          <div className="card">
            <p>Current Topic</p>
            <h2>{topic}</h2>
          </div>
          <div id="prev-label" className="card">
            <p>Previous Labels</p>
            <p className="inside-score">
              <span>Relevant: </span>
              <span className="score-num">
                {(res.label.status && res.label.relev !== -1)? res.label.relev : 'No Record.'}
              </span>
            </p>
            <p className="inside-score" style={res.label.relev === '0'? {color: 'grey'} : null}>
              <span>Stance: </span>
              <span className="score-num">
                {res.label.status? stance : 'No Record.'}
              </span>
            </p>
            <p className="inside-score">
              {res.label.doLater? (
                <span>
                  (Do Later)
                </span>
              ) : null}
              {res.label.suggestRemove? (
                <span>
                  (Suggest Remove)
                </span>
              ) : null}
            </p>
            <p className="inside-score" style={{ color: 'grey', fontSize: '0.9em', marginTop: '1.3em' }}>
              <span>Label Time: </span>
              <span className="score-num">
                {res.label.status? res.label.timestamp : 'No Record.'}
              </span>
            </p>
          </div>
          <div className="card">
            <Label
              label={props.label}
              submitLabel={props.submitLabel}
              submittedLabel={props.submittedLabel}
              handleLabelChange={props.handleLabelChange}
              waitingSubmitLabel={props.waitingSubmitLabel}
            />
          </div>
        </div>
        {(showIdx + 1) % wantCnt === 0? null : (
          <div id="content-next" onClick={nextContent}>
            <SkipNextIcon style={{ fontSize: '1.5em' }} />
            <p>(<u>→</u>)</p>
          </div>
        )}
      </div>
    )
  } else {
    return null
  }
}

Content.propTypes = {
  topic: PropTypes.string,
  isShow: PropTypes.bool,
  hideContent: PropTypes.func,

  showIdx: PropTypes.number,
  querySegList: PropTypes.array,
  res: PropTypes.object,

  submitLabel: PropTypes.func,
  submittedLabel: PropTypes.bool,
  label: PropTypes.object,
  handleLabelChange: PropTypes.func,
  waitingSubmitLabel: PropTypes.bool,
  nextContent: PropTypes.func,
  prevContent: PropTypes.func,
}

export default Content
