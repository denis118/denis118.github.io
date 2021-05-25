'use strict';

import {
  bookTheUser,
  highlightForm
} from './form.min.js';

import {
  scrollDown,
  watchWindow
} from './scroll.min.js';

[
  bookTheUser,
  highlightForm,
  scrollDown,
  watchWindow
].forEach(item => item());