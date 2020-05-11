/** @jsx jsx */
import {css, jsx} from '@emotion/core'
import {settingsMinMax} from './useModel'

const Range = ({name, value, onChange}) => {
  const [min, max] = settingsMinMax[name]
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value[name]}
      step={(max - min) / 1000}
      onChange={(e) => {
        onChange({...value, [name]: +e.target.value})
      }}
    ></input>
  )
}

const ChatSettingSliders = (props) => {
  return (
    <div
      css={css`
        display: table;
        label {
          display: table-row;
          height: 27px;
        }
        span {
          display: table-cell;
          padding-right: 5px;
          vertical-align: middle;
          text-align: right;
        }
        input {
          width: 500px;
          height: 25px;
          vertical-align: middle;
        }
        @media (max-width: 750px) {
          width: 100%;
          span {
            display: block;
            text-align: center;
            padding-top: 3px;
          }
          input {
            width: 100%;
          }
        }
      `}
    >
      <label>
        <span>Closeness Damping</span>
        <span>
          <Range name="closenessDamping" {...props} />
        </span>
      </label>
      <label>
        <span>Scaling</span>
        <span>
          <Range name="scaling" {...props} />
        </span>
      </label>
      <label>
        <span>Log Scaling</span>
        <span>
          <Range name="logScaling" {...props} />
        </span>
      </label>
      <label>
        <span>Bandwidth Bias</span>
        <span>
          <Range name="bandwidthBias" {...props} />
        </span>
      </label>
      <label>
        <span>Bandwidth Variance</span>
        <span>
          <Range name="bandwidthVariance" {...props} />
        </span>
      </label>
    </div>
  )
}

export default ChatSettingSliders
