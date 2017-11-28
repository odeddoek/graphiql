/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import debounce from '../../utility/debounce';

export default class SearchBox extends React.Component {
  static propTypes = {
    searchText: PropTypes.string,
    showQueries: PropTypes.bool,
    showMutations: PropTypes.bool,
    showSubscriptions: PropTypes.bool,
    showOthers: PropTypes.bool,
    placeholder: PropTypes.string,
    onSearch: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchText: props.searchText || '',
      showMutations: props.showMutations || true,
      showSubscriptions: props.showSubscriptions || true,
      showQueries: props.showQueries || true,
      showOthers: props.showOthers || true,
    };
    this.debouncedOnSearch = debounce(200, this.props.onSearch);
  }

  render() {
    return (
      <div>
        <label className="search-box">
          <input
            name="searchText"
            value={this.state.searchText}
            onChange={this.handleTextChange}
            type="text"
            placeholder={this.props.placeholder}
          />
          {this.state.value &&
            <div className="search-box-clear" onClick={this.handleClear}>
              {'\u2715'}
            </div>}
          <div style={{ display: 'inline-block' }}>
            <input
              name="showQueries"
              id="checkBox"
              type="checkbox"
              checked={this.state.showQueries}
              onChange={this.handleCheckboxChange}
            />
            <span>{'query'}</span>
          </div>
          <div style={{ display: 'inline-block' }}>
            <input
              name="showMutations"
              id="checkBox"
              type="checkbox"
              checked={this.state.showMutations}
              onChange={this.handleCheckboxChange}
            />
            <span>{'mutation'}</span>
          </div>
          <div style={{ display: 'inline-block' }}>
            <input
              name="showSubscriptions"
              id="checkBox"
              type="checkbox"
              checked={this.state.showSubscriptions}
              onChange={this.handleCheckboxChange}
            />
            <span>{'subscription'}</span>
          </div>
          <div style={{ display: 'inline-block' }}>
            <input
              name="showOthers"
              id="checkBox"
              type="checkbox"
              checked={this.state.showOthers}
              onChange={this.handleCheckboxChange}
            />
            <span>{'other'}</span>
          </div>
        </label>
      </div>
    );
  }

  handleTextChange = event => {
    const field = event.target.name;
    this.setState({ [field]: event.target.value });
    this.debouncedOnSearch({ ...this.state, [field]: event.target.value });
  };

  handleCheckboxChange = event => {
    const field = event.target.name;
    this.setState({ [field]: event.target.checked });
    this.debouncedOnSearch({ ...this.state, [field]: event.target.checked });
  };

  handleClear = () => {
    this.setState({
      searchText: '',
      showMutations: true,
      showSubscriptions: true,
      showQueries: true,
      showOthers: true,
    });
    this.props.onSearch('');
  };
}
