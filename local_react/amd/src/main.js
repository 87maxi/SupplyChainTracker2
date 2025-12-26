define(['./module'], function(reactModule) {
    return {
        init: function() {
            // This will be called when the page loads
            reactModule.init('react-root');
        }
    };
});