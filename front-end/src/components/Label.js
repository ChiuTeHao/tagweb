import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@material-ui/core/Tooltip'
import CircularProgress from '@material-ui/core/CircularProgress'
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn'

const Label = (props) => {
  const {label, submitLabel, submittedLabel, waitingSubmitLabel, handleLabelChange} = props

  const relev_data = [
    [0, '0 / `'],
    [1, '1'],
    [2, '2'],
    [3, '3'],
  ]

  const stance_data = [
    ['For',       1,  '7 / Q / F'],
    ['Observing', 0,  '8 / W / O'],
    ['Against',   -1, '9 / E / A'],
  ]

  return (
    <div id="label">
      <h3>Add Labels</h3>
      <form onSubmit={(e) => {e.preventDefault(); submitLabel()}}>
        <div>
          <label><b>Relevant</b> </label>
          {relev_data.map(relev =>
            <Tooltip title={
              <span style={{ fontSize: '1.5em' }}>{relev[1]}</span>
            } placement="top" key={relev[0]} >
              <label className={"radio" +
                  (label.relev === relev[0].toString()? ' active' : '')}>
                <input
                  type="radio" name="relev" value={relev[0]}
                  checked={label.relev === relev[0].toString()}
                  onChange={handleLabelChange}
                />
                {relev[0]}
              </label>
            </Tooltip>
          )}
        </div>
        <div>
          <label style={label.relev === '0'? {color: 'grey'} : null}>
            <b>Stance </b>
          </label>
          {stance_data.map(stance =>
            <Tooltip title={
              <span style={{ fontSize: '1.5em' }}>{stance[2]}</span>
            } key={stance[0]} >
              <label
                className={"radio" + (label.stance === stance[1].toString()? ' active' : '')}
                style={label.relev === '0'? {color: 'grey'} : null}
              >
                <input
                  type="radio"
                  name="stance"
                  disabled={label.relev === '0'}
                  value={stance[1]}
                  checked={label.stance === stance[1].toString()}
                  onChange={handleLabelChange}
                />
                {stance[0]}
              </label>
            </Tooltip>
          )}
        </div>
        <div>
          <Tooltip title={
            <span style={{ fontSize: '1.5em' }}>D</span>
          }>
            <label className={"radio" +
                (label.doLater? ' active' : '')}>
              <input
                type="checkbox"
                name="doLater"
                checked={label.doLater}
                onChange={handleLabelChange}
              />
              Do Later
            </label>
          </Tooltip>
          <Tooltip title={
            <span style={{ fontSize: '1.5em' }}>S</span>
          }>
            <label className={"radio" +
                (label.suggestRemove? ' active' : '')}>
              <input
                type="checkbox"
                name="suggestRemove"
                checked={label.suggestRemove}
                onChange={handleLabelChange}
              />
              Suggest Remove
            </label>
          </Tooltip>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <span style={{ visibility: 'hidden' }}>
            <CircularProgress size={20} />
          </span>
          {submittedLabel? (
            <button type="submit" disabled>
              Submitted
            </button>
          ) : (
            <Tooltip title={
              <KeyboardReturnIcon />
            }>
              <button type="submit">
                <span>Submit</span>
              </button>
            </Tooltip>
          )}
          <span style={{
            visibility: waitingSubmitLabel? 'visible': 'hidden',
          }}>
            <CircularProgress size={20} />
          </span>
        </div>
      </form>
    </div>
  )
}

Label.propTypes = {
  submitLabel: PropTypes.func,
  submittedLabel: PropTypes.bool,
  label: PropTypes.object,
  waitingSubmitLabel: PropTypes.bool,
  handleLabelChange: PropTypes.func,
}

export default Label
