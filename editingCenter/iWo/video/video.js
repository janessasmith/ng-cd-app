'use strict';
angular.module('videoModule', [
        "ngSanitize",
        "com.2fdevs.videogular",
        "com.2fdevs.videogular.plugins.controls",
        "com.2fdevs.videogular.plugins.buffering",
        "com.2fdevs.videogular.plugins.overlayplay"
    ])
    .controller('videoCtrl',
        function($scope, $sce) {
            $scope.config = {
                preload: "none",
                sources: [{
                    src: $sce.trustAsResourceUrl("./editingCenter/iWo/video/video.mp4"),
                    type: "video/mp4"
                }
                // , {
                //     src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"),
                //     type: "video/webm"
                // }, {
                //     src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"),
                //     type: "video/ogg"
                // }
                ],
                tracks: [{
                    src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                    kind: "subtitles",
                    srclang: "en",
                    label: "English",
                    default: ""
                }],
                theme: {
                    url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                },
                plugins: {
                    controls: {
                        autoHide: true,
                        autoHideTime: 5000
                    },
                    // poster: ""
                }
            };
        }
    );
