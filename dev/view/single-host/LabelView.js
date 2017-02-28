define([
    "tracemon.env.utils"
], function(utils){

    var LabelView = function(env, nodeView) {
        this.id = nodeView.id;
        this.node = nodeView;
        this.x = null;
        this.y = null;
        this.alignment = null;
    };


    LabelView.prototype = {
        isVisible: function(){
          return !(this.isFocusOut() || (env.mainView.view.hoveredPath != null && !this.isHovered()));
        },
        
        isHovered: function(){
          return this.node.isHovered();
        },

        update: function(){
            this.id = this.node.id;
            // this._coordinates = {
            //     x: this._graphNode.x,
            //     y: this._graphNode.y
            // };

            // Update the svg involved
        },

        isFocusOut: function () {
            if (env.currentSearchResults) {
                var traceroutes = this.model.traceroutes;
                for (var n=0,length=traceroutes.length; n<length; n++){
                    if (env.currentSearchResults.in[traceroutes[n].id]){
                        return false;
                    }
                }
                return true;
            }

            return false;
        },

        _getDefaultLabel: function(){
            var label, nodeAs;

            nodeAs = this.node.model.getAutonomousSystem();
            if (this.node.model.isIxp && this.node.model.ixp.name){
                label = this.node.model.ixp.name;
                if (nodeAs){
                    label += ' (AS' + nodeAs.id + ')';
                }
            } else if (this.node.model.isProbe) {
                label = "Probe " + this.node.model.probeId;
                if (nodeAs){
                    label += ' (AS' + nodeAs.id + ')';
                }
            } else if (this.node.model.ip == null){
                label = "* ";
                if (nodeAs){
                    label += ' (Guess: AS' + nodeAs.id + ')';
                }
            } else {
                label = this.node.model.ip;
                if (nodeAs){
                    label += ' (AS' + nodeAs.id + ')';
                }
            }

            return label;
        },


        getText: function(){
            var label, host;

            switch (env.labelLevel){
                case "geo":
                    if (this.node.model.getLocation() !== undefined){
                        label = this.node.model.getLocation().country;
                    } else {
                        env.connector
                            .getGeolocation(this.node)
                            .done(function(label){
                                // Update locally stored SVG
                            });
                        label = "loading...";
                    }
                    break;

                case "reverse-lookup":
                    if (this.node.model.reverseDns !== undefined){
                        label = this.node.model.reverseDns;
                    } else {
                        env.connector
                            .getHostReverseDns(host)
                            .done(function(label){
                                // Update locally stored SVG
                            });
                        label = "loading...";
                    }
                    break;
            }

            return label || this._getDefaultLabel();
        },

        isFocusOut: function () {
            return this.node.isFocusOut();
        },

        
        getShortText: function(){
            var label, nodeAs;

            label = ""; // Empty if no short label available!
            nodeAs = this.node.model.getAutonomousSystem();
            switch (env.labelLevel){
                case "geo":
                    break;

                case "reverse-lookup":
                    break;

                case "ip":
                    if (this.node.model.isIxp && this.node.model.ixp.name){
                        label = this.node.model.ixp.name;
                    } else if (nodeAs){
                        label = (nodeAs.shortName) ? nodeAs.shortName : "AS" + nodeAs.id;
                    }
                    break;
            }

            return label;
        },

        getCoordinates: function(){
            if (!this._coordinates){
                this.update();
            }
            return this._coordinates;
        },

        getClass: function(selector){
            var classes;

            classes = ["node-label", "node-label-" + utils.getIdFromIp(this.id)];

            if (this.node.model.isProbe){
                classes.push("probe");
            }

            if (this.node.model.isIxp){
                classes.push("ixp");
            }

            if (this.node.model.isTarget){
                classes.push("target");
            }

            if (this.node.model.isLast){
                classes.push("last");
            }

            return (selector) ? classes.join(".") : classes.join(" ");;
        },

        getDynamicText: function(){
            return (this.node.isHovered()) ? this.getText() : this.getShortText();
        }

    };



    return LabelView;
});