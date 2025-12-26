define(['react', 'react-dom', './react-app/src/App'], function(React, ReactDOM, App) {
    return {
        init: function(rootElementId) {
            const root = ReactDOM.createRoot(document.getElementById(rootElementId));
            root.render(React.createElement(App));
        }
    };
});