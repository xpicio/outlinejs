import { BaseComponent } from './components';
import React from 'react';

export class BaseView extends BaseComponent {
  static get childContextTypes() {
    return {
      request: React.PropTypes.object
    };
  }

  getChildContext() {
    return {
      request: this.props.__request
    };
  }
}
