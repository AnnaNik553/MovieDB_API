import React, { Component } from 'react'
import debounce from 'lodash/debounce'

import './SearchForm.css'

export default class SearchForm extends Component {
  debouncedFn = debounce((value) => this.props.getMovies(value), 500)

  constructor(props) {
    super(props)
    this.textInput = React.createRef()
    this.state = {
      label: '',
    }
  }

  componentDidMount() {
    this.textInput.current.focus()
  }

  onChange = ({ target }) => {
    this.setState({
      label: target.value,
    })
    if (!target.value.trim()) return
    this.debouncedFn(target.value)
  }

  onSubmit = (e) => {
    e.preventDefault()
  }

  render() {
    const { label } = this.state

    return (
      <form onSubmit={this.onSubmit} className="form">
        <input
          type="text"
          className="form__input"
          placeholder="Type to search..."
          value={label}
          onChange={this.onChange}
          ref={this.textInput}
        />
      </form>
    )
  }
}
