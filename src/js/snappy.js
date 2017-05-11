const FTScroller = require('ftscroller');

const container = document.querySelector('#generators');

scroller = new FTScroller(container, {
    scrollbars: false,
    scrollingX: false,
    scrollingClassName: 'generators-container'
,});
