import React, { Component } from 'react'
import debounce from 'lodash/debounce'

import './SearchForm.css'

export default class SearchForm extends Component {
  state = {
    label: '',
  }

  debouncedFn = debounce((value) => this.props.getMovies(value), 300)

  onChange = (e) => {
    this.setState({
      label: e.target.value,
    })
    if (e.target.value.trim() === '') {
      return
    }
    this.debouncedFn(e.target.value)
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
        />
      </form>
    )
  }
}
