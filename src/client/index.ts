import * as ReactDOM from 'react-dom';
import * as React from 'react';

import './index.less';

import '../common/index';
import routes from './routes';

ReactDOM.render(React.createElement(routes), document.getElementById('app'));
