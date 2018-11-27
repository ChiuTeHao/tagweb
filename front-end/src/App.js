import React, { Component } from 'react'

/* Home */
import Register from './components/Register.js'
import SearchBar from './components/topic/SearchBar.js'
import ResultList from './components/ResultList.js'
import Content from './components/Content.js'
/* Header */
import Header from './components/Header.js'
/* Variables */
import Variables from './components/Variables.js'

import './App.css'
import './theme.css'

const About = () => {
  const tutors = ['鄭卜壬']
  const students = ['倪溥辰', '鄭淵仁']

  return (
    <div id="about" className="card">
      <h1>Authors</h1>
      <h2>Advisor</h2>
      <ul>
        {tutors.map(tutor => (
          <li key={ tutor } >
            { tutor }
          </li>
        ))}
      </ul>
      <h2>Student</h2>
      <ul>
        {students.map(student => (
          <li key={ student } >
            { student }
          </li>
        ))}
      </ul>
    </div>
  )
}

const SampleQuery = () => {
  const dataHeader = ['報別', '年份', '篇數']

  const data = [
    ['聯合 (udn)',            '2018/6 ~ 2017/6', '348,284'],
    ['自由時報 (ltn)',        '2017 ~ 2005',        '803,774'],
    ['中國時報 (chinatimes)', '2017 ~ 2012',        '2,071,133'],
    ['TVBS',                  '2017 ~ 2005',        '398,548'],
    ['蘋果 (appledaily)',     '2017 ~ 2004',        '1,225,536']
  ]

  return (
    <div id="sample-query" className="card">
      <h1>Data Distribution</h1>
      <table>
        <thead>
          <tr>
            {dataHeader.map(header =>
              <th>{header}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map(row =>
            <tr>
              {row.map(d =>
                <td>{d}</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

class App extends Component {
  tabs = [
    'Home',
    'Data Distribution',
    'Authors',
  ]

  defaultLabel = {
    relev: '-1',
    stance: '999',
    doLater: false,
    suggestRemove: false,
  }

  state = {
    /* Header */
    activeTab: this.tabs[0],
    loginStatus: {
      status: false,
      message: null,
    },
    name: '',
    waitingLogin: false,
    /* Register */
    registerStatus: {
      status: false,
      message: null,
    },
    waitingRegister: false,
    /* Search */
    topicList: [],
    query: {
      topicId: 'default',
      queryList: [
        '',
      ],
      currRank: 0,
      isLabel: false,
    },
    waitingResult: false,
    /* Search Return */
    result: {
      status: false,
      useTime: 0,
      querySegList: [[]],
      totRank: 0,
      totPage: 0,
      resultList: [],
    },
    /* Content */
    label: this.defaultLabel,
    submittedLabel: false,
    waitingSubmitLabel: false,
    isShowContent: false,
    showIdx: 0,
  }

  title = 'Topic Sentiment Query'

  /* Header */

  changeActiveTab(name) {
    this.setState({
      activeTab: name,
    })
  }

  /* Account */

  async login(e) {
    e.preventDefault()

    this.setState({
      waitingLogin: true,
    })

    const data = new FormData(e.target)
    const name = data.get('name')

    let res = await fetch('/api/login', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: name,
      }),
    })
    res = await res.json()

    if (res.status) {
      this.setState({
        loginStatus: res,
        name: name,
        waitingLogin: false,
      }, () => {
        document.querySelector('select[name="topic"]').focus()
      })
    } else {
      this.setState({
        waitingLogin: false,
        loginStatus: res,
      })
    }
  }

  logout() {
    this.setState({
      loginStatus: {
        status: false,
        message: '',
      },
      result: {
        status: false,
        useTime: 0,
        querySegList: [],
        totRank: 0,
        resultList: [],
      },
      name: '',
    })
  }

  async register(e) {
    e.preventDefault()

    this.setState({
      registerStatus: {
        status: false,
        message: '',
      },
      waitingRegister: true,
    })

    const data = new FormData(e.target)
    const name = data.get('name')

    let res = await fetch('/api/register', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: name,
      }),
    })
    res = await res.json()

    this.setState({
      registerStatus: res,
      waitingRegister: false,
    })
  }

  /* Search */

  handleIsLabelChange(e) {
    let newQuery = JSON.parse(JSON.stringify(this.state.query))
    newQuery.isLabel = !newQuery.isLabel
    this.setState({
      query: newQuery,
    }, () => {
      if (this.state.name) {
        this.sendSubmit()
      }
    })
  }

  handleTopicChange(e) {
    let newQuery = JSON.parse(JSON.stringify(this.state.query))
    const topicId = e.target.value
    newQuery.topicId = topicId
    newQuery.queryList = ['']
    this.setState({
      query: newQuery,
    }, () => {
      let queryList = document.querySelector('input[name="queryList"]')
      if (queryList) {
        queryList.focus()
      }
    })
  }

  handleQueryChange(e, idx) {
    let newQuery = JSON.parse(JSON.stringify(this.state.query))
    newQuery.queryList[idx] = e.target.value
    this.setState({
      query: newQuery,
    })
  }

  subQuery(idx) {
    let newQuery = JSON.parse(JSON.stringify(this.state.query))
    newQuery.queryList.splice(idx, 1)
    this.setState({
      query: newQuery,
    }, () => {
      let queryListInput = document.querySelectorAll('input[name="queryList"]')
      if (queryListInput) {
        queryListInput[queryListInput.length - 1].focus()
      }
    })
  }

  addQuery() {
    let newQuery = JSON.parse(JSON.stringify(this.state.query))
    // newQuery.queryList.splice(idx, 0, '')
    newQuery.queryList.push('')
    this.setState({
      query: newQuery,
    }, () => {
      let queryListInput = document.querySelectorAll('input[name="queryList"]')
      if (queryListInput) {
        queryListInput[queryListInput.length - 1].focus()
      }
    })
  }

  async getTopics() {
    let res = await fetch('/api/topics')
    res = await res.json()

    this.setState({
      topicList: res
    })
  }

  async sendSubmit() {
    const {topicList} = this.state
    const {topicId, queryList, currRank, isLabel} = this.state.query

    if (topicId !== 'default') {
      let res = await fetch('/api/bm25_topic', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: this.state.name,
          topic: topicList[topicId].topic,
          queryList: queryList,
          wantRank: currRank,
          isLabel: isLabel,
        }),
      })
      res = await res.json()

      if (res.status) {
        this.setState({
          result: res,
        })
      }
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault()
    let newQuery = JSON.parse(JSON.stringify(this.state.query))
    newQuery.currRank = 0

    if (this.state.name) {
      this.setState({
        waitingResult: true,
        query: newQuery,
      }, async () => {
        await this.sendSubmit()
        this.setState({
          waitingResult: false,
        })
      })
    }
  }

  turnPage(currRank) {
    if (this.state.name) {
      let newQuery = JSON.parse(JSON.stringify(this.state.query))
      newQuery.currRank = currRank
      this.setState({
        query: newQuery,
      }, () => {this.sendSubmit()})
    }
  }

  /* Content */

  showContent(idx) {
    const {label} = this.state.result.resultList[idx]

    if (label.status) {
      this.setState({
        label: label,
        submittedLabel: true,
      })
    } else {
      this.setState({
        label: this.defaultLabel,
        submittedLabel: false,
      })
    }

    this.setState({
      isShowContent: true,
      showIdx: idx,
    })
  }

  hideContent(e) {
    if (e.target === document.getElementById('content')) {
      this.setState({
        isShowContent: false
      })
    }
  }

  nextContent() {
    const {showIdx} = this.state
    if (showIdx + 1 < Variables.wantCnt) {
      this.setState({
        isShowContent: false
      }, () => {
        this.showContent(showIdx + 1)
      })
    }
  }

  prevContent() {
    const {showIdx} = this.state
    if (showIdx - 1 >= 0) {
      this.setState({
        isShowContent: false
      }, () => {
        this.showContent(showIdx - 1)
      })
    }
  }

  async submitLabel() {
    this.setState({
      waitingSubmitLabel: true,
    })

    const {name, query, result, showIdx, label, topicList} = this.state

    const data = {
      name: name,
      topic: topicList[query.topicId].topic,
      url: result.resultList[showIdx].url,
      label: label,
    }

    let res = await fetch('/api/add_label', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    })
    res = await res.json()

    if (res.status) {
      let newResult = JSON.parse(JSON.stringify(result))
      newResult.resultList[showIdx].label = res
      this.setState({
        submittedLabel: true,
        result: newResult,
      })
    }

    this.setState({
      waitingSubmitLabel: false,
    })
  }

  handleLabelChange(e) {
    this.setState({
      submittedLabel: false,
    })
    const target = e.target

    let label = JSON.parse(JSON.stringify(this.state.label))
    const name = target.name
    if (target.type === 'checkbox') {
      label[name] = !(label[name])
    } else {
      label[name] = target.value
      if (name === 'relev' && target.value === '0') {
        label.stance = 999
      }
    }

    this.setState({
      label: label,
    })
  }

  componentDidMount () {
    this.getTopics()
    let register = document.getElementById('register')
    if (register) {
      register.querySelector('input').focus()
    }
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
          if (document.activeElement.nodeName === 'INPUT'
            && document.activeElement.name === 'queryList'
            && !this.state.submittedLabel) {
            e.preventDefault()
            let newQuery = JSON.parse(JSON.stringify(this.state.query))
            newQuery.currRank = 0

            if (this.state.name) {
              this.setState({
                waitingResult: true,
                query: newQuery,
              }, async () => {
                await this.sendSubmit()
                this.setState({
                  waitingResult: false,
                })
              })
            }
          }
          break
        case 'Tab':
          if (document.activeElement.nodeName === 'INPUT'
            && document.activeElement.name === 'queryList'
            && document.activeElement.className === 'last-query'
            && !e.shiftKey) {
            e.preventDefault()
            this.addQuery()
          }
          break
        default:
          break
      }
      if (this.state.isShowContent) {
        let label = JSON.parse(JSON.stringify(this.state.label))
        let inside = document.querySelector('#content .inside')
        switch(e.key) {
          case 'Escape':
            this.setState({
              isShowContent: false
            })
            break
          case 'Enter':
            if (!this.state.submittedLabel) {
              this.submitLabel()
              e.preventDefault()
            }
            break
          case '`':
            if (this.state.label.relev !== '0') {
              label.relev = '0'
              this.setState({
                label: label,
                submittedLabel: false,
              })
            }
            break
          case '0':
            if (this.state.label.relev !== '0') {
              label.relev = '0'
              label.stance = 999
              this.setState({
                label: label,
                submittedLabel: false,
              })
            }
            break
          case '1':
          case '2':
          case '3':
            if (this.state.label.relev !== e.key) {
              label.relev = e.key
              this.setState({
                label: label,
                submittedLabel: false,
              })
            }
            break
          case '7':
          case 'Q':
          case 'q':
          case 'F':
          case 'f':
            if (this.state.label.stance !== '1') {
              label.stance = '1'
              this.setState({
                label: label,
                submittedLabel: false,
              })
            }
            break
          case '8':
          case 'W':
          case 'w':
          case 'O':
          case 'o':
            if (this.state.label.stance !== '0') {
              label.stance = '0'
              this.setState({
                label: label,
                submittedLabel: false,
              })
            }
            break
          case '9':
          case 'E':
          case 'e':
          case 'A':
          case 'a':
            if (this.state.label.stance !== '-1') {
              label.stance = '-1'
              this.setState({
                label: label,
                submittedLabel: false,
              })
            }
            break
          case 'D':
          case 'd':
            label.doLater = !this.state.label.doLater
            this.setState({
              label: label,
              submittedLabel: false,
            })
            break
          case 'S':
          case 's':
            label.suggestRemove = !this.state.label.suggestRemove
            this.setState({
              label: label,
              submittedLabel: false,
            })
            break
          case 'ArrowLeft':
            if (document.activeElement.nodeName !== 'INPUT'
                 && document.activeElement.nodeName !== 'SELECT') {
              this.prevContent()
            }
            break
          case 'ArrowRight':
            if (document.activeElement.nodeName !== 'INPUT'
                 && document.activeElement.nodeName !== 'SELECT') {
              this.nextContent()
            }
            break
          case 'ArrowUp':
            if (document.activeElement.nodeName !== 'INPUT'
                 && document.activeElement.nodeName !== 'SELECT') {
              inside.scrollTo({
                top: inside.scrollTop - 300,
                behavior: 'smooth',
              })
            }
            break
          case 'ArrowDown':
            if (document.activeElement.nodeName !== 'INPUT'
                 && document.activeElement.nodeName !== 'SELECT') {
              inside.scrollTo({
                top: inside.scrollTop + 300,
                behavior: 'smooth',
              })
            }
            break
          case 'PageUp':
            inside.scrollTo({
              top: inside.scrollTop - inside.clientHeight,
              behavior: 'smooth',
            })
            break
          case 'PageDown':
            inside.scrollTo({
              top: inside.scrollTop + inside.clientHeight,
              behavior: 'smooth',
            })
            break
          case 'Home':
            inside.scrollTo({
              top: 0,
              behavior: 'smooth',
            })
            break
          case 'End':
            inside.scrollTo({
              top: inside.scrollHeight,
              behavior: 'smooth',
            })
            break
          default:
            break
        }
      } else if (document.activeElement.nodeName !== 'INPUT'
                 && document.activeElement.nodeName !== 'SELECT') {
        const currRank = this.state.query.currRank
        const totRank = this.state.result.totRank
        switch(e.key) {
          case '0':
            this.showContent(0)
            break
          case 'Escape':
            this.showContent(this.state.showIdx)
            break
          case 'ArrowLeft':
            if (currRank > 1) {
              this.turnPage(currRank - Variables.wantCnt)
            }
            break
          case 'ArrowRight':
            if (currRank < totRank) {
              this.turnPage(currRank + Variables.wantCnt)
            }
            break
          // case '5':
          //   this.sendSubmit()
          //   break
          default:
            break
        }
      }
    })
  }

  render () {
    document.title = this.title
    const {activeTab, topicList, query} = this.state
    const topic = (query.topicId === 'default')? '' : topicList[query.topicId].topic

    if (this.state.isShowContent) {
      document.body.className = 'overflow-hidden'
    } else {
      document.body.className = ''
    }

    return (
      <div>
        <Header
          title={this.title}

          activeTab={activeTab}
          tabs={this.tabs}
          changeActiveTab={this.changeActiveTab.bind(this)}

          waitingLogin={this.state.waitingLogin}
          loginStatus={this.state.loginStatus}
          name={this.state.name}
          login={this.login.bind(this)}
          logout={this.logout.bind(this)}
        />
        <div className="blank"></div>
        <div>
          {activeTab === this.tabs[0]? (
            <div>
              {this.state.loginStatus.status? (
                <div>
                  <SearchBar
                    topicList={this.state.topicList}
                    topicId={query.topicId}
                    queryList={query.queryList}
                    subQuery={this.subQuery.bind(this)}
                    addQuery={this.addQuery.bind(this)}
                    handleTopicChange={this.handleTopicChange.bind(this)}
                    handleQueryChange={this.handleQueryChange.bind(this)}
                    handleFormSubmit={this.handleFormSubmit.bind(this)}
                  />
                  <ResultList
                    result={this.state.result}
                    isLabel={this.state.query.isLabel}
                    handleIsLabelChange={this.handleIsLabelChange.bind(this)}
                    sendSubmit={this.sendSubmit.bind(this)}

                    waitingResult={this.state.waitingResult}
                    showContent={this.showContent.bind(this)}
                    currRank={this.state.query.currRank}
                    totRank={this.state.result.totRank}
                    turnPage={this.turnPage.bind(this)}
                  />
                  <Content
                    topic={topic}
                    isShow={this.state.isShowContent}
                    waitingSubmitLabel={this.state.waitingSubmitLabel}
                    hideContent={this.hideContent.bind(this)}

                    showIdx={this.state.showIdx}
                    querySegList={this.state.result.querySegList}
                    res={this.state.result.resultList[this.state.showIdx]}

                    submitLabel={this.submitLabel.bind(this)}
                    submittedLabel={this.state.submittedLabel}
                    label={this.state.label}
                    handleLabelChange={this.handleLabelChange.bind(this)}
                    nextContent={this.nextContent.bind(this)}
                    prevContent={this.prevContent.bind(this)}
                  />
                </div>
              ) : (
                <div id="front-page">
                  <Register
                    title={'Login'}
                    text={'Use your account or "guest" to login.'}
                    status={this.state.loginStatus}
                    waiting={this.state.waitingLogin}
                    register={this.login.bind(this)}
                  />
                  <Register
                    title={'Register'}
                    text={'Register a new account name.'}
                    status={this.state.registerStatus}
                    waiting={this.state.waitingRegister}
                    register={this.register.bind(this)}
                  />
                </div>
              )}
            </div>
          ) : activeTab === this.tabs[1]? (
            <SampleQuery />
          ) : (
            <About />
          )}
        </div>
      </div>
    )
  }
}

export default App
