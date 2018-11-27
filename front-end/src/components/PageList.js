import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Variables from './Variables.js'

import './PageList.css'

class PageList extends Component {
  state = {
    formRank: this.props.currRank
  }

  handleFormRankChange(e) {
    this.setState({
      formRank: parseInt(e.target.value, 10) - 1,
    })
  }

  handleSubmit (e) {
    e.preventDefault()

    this.props.turnPage(this.state.formRank)
  }

  render () {
    const {currRank, totRank, turnPage} = this.props
    const wantCnt = Variables.wantCnt

    // make up pageList
    let pageList = [currRank]
    if (currRank > 0) {
      for (let cnt = 1; cnt < 4; ++cnt) {
        let rankToAdd = currRank - cnt * wantCnt
        if (rankToAdd > 0) {
          pageList.unshift(rankToAdd)
        } else {
          pageList.unshift(0)
          break
        }
      }
    }
    if (currRank < totRank - 1) {
      for (let cnt = 1; cnt < 4; ++cnt) {
        let rankToAdd = currRank + cnt * wantCnt
        if (rankToAdd < totRank - 1) {
          pageList.push(rankToAdd)
        } else {
          pageList.push(totRank - 1)
          break
        }
      }
    }

    return (
      <div id="pageList" className="card">
        <form onSubmit={this.handleSubmit.bind(this)}>
          <div className="goto">
            <label>Go To Rank:</label>
            <input
              type="number"
              name="goto"
              onChange={this.handleFormRankChange.bind(this)}
              value={this.state.formRank + 1}
            />
            <button type="submit" >
              GO
            </button>
          </div>
        </form>
        <ul className="pageList">
          {(currRank === 0)? null : (
            <li>
              <button
                className="page"
                onClick={() => turnPage(currRank - wantCnt > 0? currRank - wantCnt : 0)}
              >
                Prev(<u>←</u>)
              </button>
            </li>
          )}
          {pageList[0] === 0? null : (
            <li>
              <button
                className="page"
                onClick={() => turnPage(0)}
              >
                1
              </button>
            </li>
          )}
          {pageList.map(page => (
            <li key={page}>
              <button
                className={page === currRank? 'page active':'page'}
                onClick={() => {if(page !== currRank) turnPage(page)}}
              >
                {page + 1}
              </button>
            </li>
          ))}
          {pageList[pageList.length - 1] === totRank - 1? null : (
            <li>
              <button
                className="page"
                onClick={() => turnPage(totRank - 1)}
              >
                {totRank}
              </button>
            </li>
          )}
          {currRank === totRank - 1? null : (
            <li>
              <button
                className="page"
                onClick={() => turnPage(currRank + wantCnt < totRank - 1? currRank + wantCnt : totRank - 1)}
              >
                Next(<u>→</u>)
              </button>
            </li>
          )}
        </ul>
      </div>
    )
  }
}

PageList.propTypes = {
  currRank: PropTypes.number,
  totRank: PropTypes.number,
  turnPage: PropTypes.func,
}

export default PageList
