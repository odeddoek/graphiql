/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Argument from './Argument';
import TypeLink from './TypeLink';

export default class SearchResults extends React.Component {
  static propTypes = {
    schema: PropTypes.object,
    withinType: PropTypes.object,
    searchText: PropTypes.string,
    showQueries: PropTypes.bool,
    showMutations: PropTypes.bool,
    showSubscriptions: PropTypes.bool,
    showOthers: PropTypes.bool,
    onClickType: PropTypes.func,
    onClickField: PropTypes.func,
  };

  constructor() {
    super();
    this.renderTypeMatches = this.renderTypeMatches.bind(this);
    this.renderTypeMatches = this.renderTypeMatches.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.schema !== nextProps.schema ||
      this.props.searchText !== nextProps.searchText ||
      this.props.showQueries !== nextProps.showQueries ||
      this.props.showMutations !== nextProps.showMutations ||
      this.props.showSubscriptions !== nextProps.showSubscriptions ||
      this.props.showOthers !== nextProps.showOthers
    );
  }

  render() {
    const {
      searchText,
      showQueries,
      showMutations,
      showSubscriptions,
      showOthers,
    } = this.props;
    const withinType = this.props.withinType;
    const schema = this.props.schema;

    const matchedWithin = [];
    const matchedTypes = [];
    const matchedFields = [];

    const typeMap = schema.getTypeMap();
    const rootQuery = schema.getQueryType();
    const rootMutation = schema.getMutationType();
    const rootSubscription = schema.getSubscriptionType();
    let typeNames = Object.keys(typeMap).sort();

    // Move the within type name to be the first searched.
    if (withinType) {
      typeNames = typeNames.filter(n => n !== withinType.name);
      typeNames.unshift(withinType.name);
    }

    for (const typeName of typeNames) {
      const totalMatches =
        matchedWithin.length + matchedTypes.length + matchedFields.length;

      if (totalMatches >= 100) {
        break;
      }

      const type = typeMap[typeName];

      if (!showQueries && typeName === rootQuery.name) {
        continue;
      } else if (!showMutations && typeName === rootMutation.name) {
        continue;
      } else if (!showSubscriptions && typeName === rootSubscription.name) {
        continue;
      } else if (
        !showOthers &&
        typeName !== rootQuery.name &&
        typeName !== rootMutation.name &&
        typeName !== rootSubscription.name
      ) {
        continue;
      }

      if (withinType !== type && isMatch(typeName, searchText)) {
        matchedTypes.push({ type, typeName });
      }

      if (type.getFields) {
        const fields = type.getFields();
        Object.keys(fields).sort().forEach(fieldName => {
          const field = fields[fieldName];
          let matchingArgs;

          if (!isMatch(fieldName, searchText)) {
            if (!field.args || !field.args.length) {
              return;
            }

            matchingArgs = field.args
              .filter(arg => isMatch(arg.name, searchText))
              .sort((a, b) => a.name.localeCompare(b.name));
            if (matchingArgs.length === 0) {
              return;
            }
          }

          if (withinType === type) {
            matchedWithin.push({ type, field, withinType, matchingArgs });
          } else {
            matchedFields.push({ type, field, withinType, matchingArgs });
          }
        });
      }
    }

    const totalMatches =
      matchedWithin.length + matchedTypes.length + matchedFields.length;

    if (totalMatches === 0) {
      return (
        <span className="doc-alert-text">
          {'No results found.'}
        </span>
      );
    }

    if (withinType && matchedTypes.length + matchedFields.length > 0) {
      return (
        <div>
          {this.renderFieldMatches(matchedWithin)}
          <div className="doc-category">
            <div className="doc-category-title">
              {'other results'}
            </div>
            {this.renderTypeMatches(matchedTypes)}
            {this.renderFieldMatches(matchedFields)}
          </div>
        </div>
      );
    }

    return (
      <div>
        {this.renderFieldMatches(matchedWithin)}
        {this.renderTypeMatches(matchedTypes)}
        {this.renderFieldMatches(matchedFields)}
      </div>
    );
  }

  renderTypeMatches(matches) {
    return matches.map(({ type, typeName }) =>
      <div className="doc-category-item" key={typeName}>
        <TypeLink type={type} onClick={this.props.onClickType} />
      </div>,
    );
  }

  renderFieldMatches(matches) {
    const { onClickType, onClickField } = this.props.onClickType;

    return matches.map(({ type, field, withinType, matchingArgs }) =>
      <div className="doc-category-item" key={type.name + '.' + field.name}>
        {withinType !== type && [
          <TypeLink key="type" type={type} onClick={onClickType} />,
          '.',
        ]}
        <a
          className="field-name"
          onClick={event => onClickField(field, type, event)}>
          {field.name}
        </a>
        {matchingArgs && [
          '(',
          <span key="args">
            {matchingArgs.map(arg =>
              <Argument
                key={arg.name}
                arg={arg}
                onClickType={this.props.onClickType}
                showDefaultValue={false}
              />,
            )}
          </span>,
          ')',
        ]}
      </div>,
    );
  }
}

function isSubtype2(rootType, type) {
  const subTypes = rootType.getFields();
  const subTypeNames = Object.keys(subTypes);

  console.log('type', type);
  console.log('subTypes', subTypes);
  console.log('subTypeNames', subTypeNames);
  const result = subTypeNames.includes(type.name);

  if (result) {
    console.log('found match..', type);
  }
  throw new Error();

  return result;
}

function isMatch(sourceText, searchValue) {
  try {
    const escaped = searchValue.replace(/[^_0-9A-Za-z]/g, ch => '\\' + ch);
    return sourceText.search(new RegExp(escaped, 'i')) !== -1;
  } catch (e) {
    return sourceText.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
  }
}
