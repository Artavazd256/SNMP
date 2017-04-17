/**
 * Created by ava on 10/24/16.
 */

//var socket = new WebSocket("ws://localhost:8080/echo_all");

function drawNetworkTopology() {
    drawNetworkTopology.switchListObject = [];
    drawNetworkTopology.netListObject = [];

    let getChildByName = function (list, name) {
        for (let i = 0; i < list.length; i++)
        {
            if (list[i].name === name)
            {
                return list[i];
            }
        }
        return null;
    };

    let calculatePosition = function (element, position) {
        element.x += (element.width / 2) + 5;
        if (position == "bottom") {
            element.y += (element.height / 2) + 28;
        } else {
            element.y += -(element.height / 2) + -5;
        }
    };

    function getGlobalPosition(element) {
        let x = element.worldTransform.tx;
        let y = element.worldTransform.ty;
        return {x:x, y: y};
    };

    function getMiddlePosition(x1,y1, x2, y2) {
        var x = Math.abs(x1-x2);
        var y = Math.abs(y1-y1);
        return {x:x , y:y};
    };

    let netObject = {};

    let getEnablePortsList = function (swName, list) {
        let enablePort = [];
        for(let i =0; i < list.length; i++){
            if(swName === list[i].fromSwitch ) {
                enablePort.push(parseInt(list[i].fromPortNumber)) ;
            }
            if(swName === list[i].toSwitch ) {
                enablePort.push(parseInt(list[i].toPortNumber)) ;
            }
        }
        return enablePort;
    };

    let disablePortColor = 0xFFFF00;
    let enablePortColor = 0x00ff00;

    let disableLineColor = 0xFFFF00;
    let enableLineColor = 0x00ff00;

    var disableElements = function () {
        for(let i = 0; i < stage.children.length; i++) {
            let o = stage.children[i];
            if(o.name === 'popupMenu') {
                o.visible = false;
            }
        }
    }

    var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
        backgroundColor: 0x1099bb,
        resolution: window.devicePixelRatio || 1
    });

    //var collision = new Bump(PIXI);
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Container(0x00000, true);
    var TitleIndex = -1;
    function getTitleIndex() {
        TitleIndex++;
        return TitleIndex;
    }
    stage.interactive  = true;
    stage.buttonMode = true;

    // Disable popup menue
    window.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false;
    });


    window.addEventListener('resize', function () {
        renderer.resize(window.innerWidth, window.innerHeight);
    });


    //function zoom(s,x,y){

    //    s = s > 0 ? 2 : 0.5;
    //    var worldPos = {x: (x - stage.x) / stage.scale.x, y: (y - stage.y)/stage.scale.y};
    //    var newScale = {x: stage.scale.x * s, y: stage.scale.y * s};
    //    var newScreenPos = {x: (worldPos.x ) * newScale.x + stage.x, y: (worldPos.y) * newScale.y + stage.y};
    //    stage.x -= (newScreenPos.x-x) ;
    //    stage.y -= (newScreenPos.y-y) ;
    //    stage.scale.x = newScale.x;
    //    stage.scale.y = newScale.y;
    //};

    //var lastPos = null
    //$('canvas')
    //.mousewheel(function(e){
    //        zoom(e.deltaY, e.offsetX, e.offsetY)
    //}).mousedown(function(e) {
    //    lastPos = {x:e.offsetX,y:e.offsetY};
    //}).mouseup(function(event) {
    //    lastPos = null;
    //}).mousemove(function(e){
    //    if(lastPos) {
    //        stage.x += (e.offsetX-lastPos.x);
    //        stage.y += (e.offsetY-lastPos.y);
    //        lastPos = {x:e.offsetX,y:e.offsetY};
    //   }
    //});



    function main(loader, res) {
        function SNMP(stage) {
            // Container
            this.stage = stage;

            this.stylePort = {
                fontFamily: 'family-name',
                fontSize: '12px',
                fontStyle: 'normal',
                //fill : '#00ff00',
                strokeThickness: 1,
            };

            this.styleTitle = {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'normal',
                //fill : '#00ff00',
                //strokeThickness : 1,
            };

            this.stylePopupMenuText = {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'normal',
                //fill : '#00ff00',
                //strokeThickness : 1,
            };

            this.notifyAll = function (data) {
                let jsonData = JSON.parse(data);
                let sw = drawNetworkTopology.switchListObject;
                for(let i = 0; i < sw.length; i++) {
                    if( jsonData.switch == sw[i].name) {
                        if(jsonData.status == "enable") {
                            sw[i].getChildByName("port" + jsonData.port).line.setEnable(false);
                        } else if(jsonData.status == "disable") {
                            sw[i].getChildByName("port" + jsonData.port).line.setDisable(false);
                        }

                        //port.line.setDisable();
                    }
                }
            };



            function deleteCon() {
                console.log("delete");
            }
            function disableCon() {
                this.port.line.setDisable(true);
                console.log("Enable");
            }
            function enableCon() {
                this.port.line.setEnable(true);
                console.log("enable");
            }

            this.popupItems = [
                {action: deleteCon, text: 'Delete', src: 'image/delete.png', name: 'delete'},
                {action: disableCon, text: 'Disable', src: 'image/disable.png', name: 'disable'},
                {action: enableCon, text: 'Enable', src: 'image/enable.png', name: 'enable'},
            ];

            this.BodyOfSwitchTitle = {
                fontFamily: 'Arial',
                fontSize: '16px',
                fontStyle: 'normal',
                //fill : '#00ff00',
                //strokeThickness : 1,
            };


            this.getSpriteByGraphics = function (graphics) {
                var texture = graphics.generateCanvasTexture();
                var sprite = new PIXI.Sprite(texture);
                return sprite;
            };

            this.createBox = function (name, color, width, height, border) {
                var graphics = new PIXI.Graphics();

                if (border != undefined) {
                    graphics.lineStyle(border.lineSize, border.color, border.alfa);
                } else {
                    graphics.lineStyle(3, 0x0040FF, 1);
                }
                graphics.beginFill(color);
                graphics.drawRect(0, 0, width, height);
                graphics.endFill();
                var sprite = this.getSpriteByGraphics(graphics);
                sprite.anchor.set(0.5);
                sprite.name = name;
                sprite.hitArea = new PIXI.Rectangle(0, 0, width, height);
                return sprite;
            };

            this.createBox1  = function (name, color, width, height, border) {
                var graphics = new PIXI.Graphics();

                if (border != undefined) {
                    graphics.lineStyle(border.lineSize, border.color, border.alfa);
                } else {
                    graphics.lineStyle(3, 0x0040FF, 1);
                }
                graphics.beginFill(color);
                graphics.drawRect(0, 0, width, height);
                graphics.endFill();
                graphics.name = name;
                //var sprite = this.getSpriteByGraphics(graphics);
                //sprite.anchor.set(0.5);
                //sprite.name = name;
                //sprite.hitArea = new PIXI.Rectangle(0, 0, width, height);
                return graphics;
            };



            this.createTitle = function (text, color, width, height, position) {
                var titleText = new PIXI.Text(text.toString(), this.styleTitle);
                var w = titleText.width < width ? width : titleText.width;
                var h = titleText.height < height ? height : titleText.height;
                var name = "title";
                var title = this.createBox(name, color, w, h, {lineSize: 5, color: color, alfa: 0.5});
                titleText.anchor.set(0.5);
                title.addChild(titleText);
                calculatePosition(title, position);
                return title;
            };

            this.showPopupMenu = function () {
                disableElements();
                var popupMenu = this.popupMenu;
                let title = this.title;
                if (popupMenu === undefined) {
                    console.error("ERROR: popupMenu undefind");
                    return;
                }
                title.visible = false;
                popupMenu.x = this.worldTransform.tx;
                popupMenu.y = this.worldTransform.ty;
                calculatePosition(popupMenu, this.portPosition);
                popupMenu.visible = true;
            };

            this.getMaxWidthOfList = function (items) {
                var n = 0;
                for (var i = 0; i < items.length; i++) {
                    var nn = items[i].width;
                    if (nn > n) {
                        n = nn;
                    }
                }
                return n;
            };

            this.getMaxHeightOfList = function (items) {
                var n = 0;
                for (var i = 0; i < items.length; i++) {
                    var nn = items[i].height;
                    if (nn > n) {
                        n = nn;
                    }
                }
                return n;
            };

            this.createSpritesByList = function (items) {
                var list = [];
                for (var i = 0; i < items.length; i++) {
                    var sprite = new PIXI.Sprite(res[items[i].name].texture);
                    sprite.name = items[i].name;
                    list.push(sprite);
                }
                return list;
            };

            this.createPopupMenu = function (color,  port) {
                // TODO need to fix hitArea of button of popupMenu
                var sprints = this.createSpritesByList(this.popupItems);
                var width = this.getMaxWidthOfList(sprints);
                var h = this.getMaxHeightOfList(sprints);
                var height = h*sprints.length;
                var popupMenu = this.createBox("popupMenu", color, width, height);
                popupMenu.visible = false;
                for (var i = 0; i < sprints.length; i++) {
                    var button = sprints[i];
                    button.interactive = true;
                    button.buttonMode = true;
                    button.actionName = this.popupItems[i].action;
                    button.port = port;
                    button.click = this.actionPopupMenu;
                    button.width = width;
                    button.x = -(width / 2);
                    button.y = (i * button.height) - (height / 2);
                    popupMenu.addChild(button);
                };
                calculatePosition(popupMenu, port);
                return popupMenu;
            };



            this.actionPopupMenu = function () {
                var name = this.name;
                this.actionName();
            };


            this.createPort = function (name, color, position, titleText, portCount, sw) {
                var portSprite = new PIXI.Sprite(res['port2'].texture);
                var indexPort = new PIXI.Text(name.toString(), this.stylePort);
                indexPort.anchor.set(0.5, 0);
                portSprite.anchor.set(0.5, 0);
                portSprite.addChild(indexPort);
                portSprite.setColor = function (color, status, isSend) {
                    if(isSend) {
                        let data = {switch: sw.name, "port" : name, status: status};
                        //socket.send(JSON.stringify(data));
                    }

                };
                portSprite.name = "port" + name;
                portSprite.portPosition = position;
                titleText = "MAC address: b8:90:e3:b10:28:44\nMAC address: b8:94:e0:b11:21:43\nMAC address: b18:70:e12:b2:27:43";
                var title = this.createTitle(titleText, 0xedef4d, portSprite.width, portSprite.height, position);
                title.visible = false;
                portSprite.titleName = title.name;
                portSprite.title = title;
                stage.addChild(title);
                var popupMenu = this.createPopupMenu(0x0FFF3F2, portSprite);
                stage.addChild(popupMenu);
                portSprite.title = title;
                portSprite.popupMenu = popupMenu;
                portSprite.interactive = true;
                portSprite.buttonMode = true;
                portSprite.mouseover = this.showTitleOfPOrt;
                portSprite.mouseout = this.hideTitleOfPort;
                portSprite.rightdown = this.showPopupMenu;
                portSprite.mouseup = function () {
                    let toPortNumber = this.getPortNumber();
                    let toSw = this.parent;
                    if(netObject.fromSw == undefined) {
                        netObject = {};
                        return;
                    }
                    // Check the 'toSwitch' and 'fromSwitch' is not same object.
                    if( netObject.fromSw.x != toSw.x && netObject.fromSw.y != toSw.y) {
                        netObject.toSw = toSw;
                        netObject.toPortNumber = parseInt(toPortNumber);
                        drawNetworkTopology.netListObject.push(netObject);
                        stage.addChild(netObject.line);
                    }
                    netObject = {};
                };
                portSprite.mousedown = function (event) {
                    let lineSize = 4;
                    let line = snmp.createLine({x: 0, y: 0}, {x:10, y:10}, lineSize);
                    netObject = {
                        line: line,
                        toSw:  null,
                        fromSw: sw,
                        toPortNumber: null,
                        fromPortNumber: parseInt(name),
                        lineSize: lineSize
                    };
                };
                portSprite.getPortNumber = function () {
                    return name;
                };

                portSprite.getLineDist = function () {
                    let n = parseInt(name);
                    let middleCountPort = portCount/2;
                    let d = 0;
                    if(position === 'bottom') {
                        d = (n-middleCountPort) - 2;
                    } else {
                        d = n + 3
                    }
                    d+= 10;
                    return d;
                };
                return portSprite;
            };


            this.hideTitleOfPort = function () {
                let info = this.title;
                if(info !== undefined) {
                    info.visible = false;
                }
            };

            this.showTitleOfPOrt = function () {
                let title = this.title;
                title.x = this.worldTransform.tx;
                title.y = this.worldTransform.ty;
                calculatePosition(title, this.portPosition);
                title.visible = true;
            };


            this.getSwitchWidth = function (portCount, dis) {
                var bodyWidth = 0;
                if ((portCount % 2) == 0) {
                    bodyWidth = (portCount / 2.) *dis;
                } else {
                    bodyWidth = (portCount / 2.) * dis + (dis / 2);
                }
                return bodyWidth;
            };

            this.splitText = function (text, n) {
                var t = '';
                var counter = 0;
                for(let i = 0; i < text.length; i++) {
                    t += text[i];
                    if(counter === n) {
                        counter = 0;
                        t += "\n";
                    }
                    counter++;
                }
                return t;
            };

            this.createBodyOfSwitch = function (name, text, color, width, height, sw) {
                let t = this.splitText(text, 20);
                var content = new PIXI.Text(t, this.BodyOfSwitchTitle);
                width = width > content.width ? width : content.width+10;
                var box = snmp.createBox1(name, color, width, height);
                box.addChild(content);
                box.x = width / 2.;
                box.y = height / 2.;
                content.x = box.width/2 - content.width/2;
                content.y = box.height/2 - content.height/2;
                box.on('mousedown', this.onDragStart)
                    .on('touchstart', this.onDragStart)
                    .on('mouseup', this.onDragEnd)
                    .on('mouseupoutside', this.onDragEnd)
                    .on('touchendoutside', this.onDragEnd)
                    .on('touchend', this.onDragEnd)
                    .on('mousemove', this.onDragMoveSwitch);
                box.interactive = true;
                box.buttonMode = true;
                return box;
            };

            this.processingText = function (text) {
                let c = 0;
                let count = text.length/2;
                var t = "";
                for(let i = 0; i < text.length; i++) {
                    if(c == count) {
                        t += '\n';
                        c = 0;
                    }
                    c++;
                    t += text[i];
                }
                return t;
            };

            this.onDragStart = function(event)
            {
                disableElements();
                // store a reference to the data
                // the reason for this is because of multitouch
                // we want to track the movement of this particular touch
                this.data = event.data;
                this.alpha = 0.5;
                this.dragging = true;
                this.dragPoint = event.data.getLocalPosition(this.parent);
                this.dragPoint.x -= this.position.x;
                this.dragPoint.y -= this.position.y;
            };

            this.onDragEnd = function () {
                this.alpha = 1;
                this.dragging = false;
                // set the interaction data to null
                this.data = null;
            };


            this.onDragMoveSwitch = function() {
                if (this.dragging) {
                    var newPosition = this.data.getLocalPosition(this.parent.parent);
                    this.parent.position.x = newPosition.x - this.dragPoint.x;
                    this.parent.position.y = newPosition.y - this.dragPoint.y;
                    localStorage[this.parent.name] = JSON.stringify({x : this.parent.x , y: this.parent.y });
                    disableElements();
                }
            };

            this.createSwitch = function (swName, portCount, text, enablePortsList) {
                var container = new PIXI.Container();
                container.interactive = true;
                container.buttonMode = true;
                container.name = swName;
                portCount = portCount * 1.;
                var index = 1;
                var portLeftOffset = 0;
                var portWidth = new PIXI.Sprite(res['port2'].texture).width;
                var offsetPort = 4.;
                var dis = portWidth + offsetPort;
                var bodyWidth = this.getSwitchWidth(portCount, dis) - offsetPort;
                var bodyHeight = 70;
                var count = Math.floor(portCount / 2);
                //text = this.processingText(text, portCount);
                var isOdd = portCount % 2 == 0 ? false : true;
                if (isOdd) {
                    count++;
                }

                for (var row = 0; row < 3; row++) {
                    for (var i = 0.; i < count; i++) {
                        let name = index.toString();
                        let portColor = enablePortsList.indexOf(index) !== -1 ? enablePortColor  :  disablePortColor;
                        if (row == 0) {
                            var port = this.createPort(name, portColor, "top", "tmp", portCount, container);
                            port.x =   i * dis;
                            container.addChild(port);
                            index++;
                        } else if (row == 2) {
                            var port = this.createPort(name, portColor, "bottom", "tmp", portCount, container);
                            var body = container.getChildByName(swName);
                            port.x = dis * i + portLeftOffset + (isOdd ? dis / 2 : 0) - (port.width/2);
                            port.x = i * dis;
                            port.y = body.height+port.height;
                            container.addChild(port);
                            index++;
                        }
                    } // end of second for loop
                    if (row == 1) {
                        var body = this.createBodyOfSwitch(swName, text, 0xFFFFFF, bodyWidth, bodyHeight, container);

                        var port = container.getChildByName("port1");
                        body.y = port.height;
                        body.x = -port.width/2;

                        container.addChild(body);
                        container.hitArea = new PIXI.Rectangle(body.x, body.y, body.width, body.height);
                        if (isOdd) {
                            count--;
                        }

                    }

                } // end of first for loop
                container.getPortByNumber = function (number) {
                    number = number.toString();
                    return container.getChildByName("port"+number);
                };
                var topPortHeight = -(port.height/2 - port.height*40/100);
                var bottomPortHeight = port.height;
                var portWidthMiddle = port.width/2;
                container.getPortPosition = function (number) {
                    number = number.toString();
                    var port = container.getChildByName("port"+number);
                    let h = port.portPosition == "bottom" ? bottomPortHeight :  topPortHeight;
                    var position = {x: port.worldTransform.tx + portWidthMiddle, y: port.worldTransform.ty + h};
                    return position;
                };

                container.getSwitchRightBorder = function () {
                    var width = container.width;
                    var x = container.x;
                    return x + width;
                };
                let W = container.width;
                let H = container.height;
                container.W = W;
                container.H = H;
                container.isOverlap = function (o) {

                    let x1 = container.x;
                    let y1 = container.y;
                    let width1 = W;
                    let height1 = H;
                    let mX1 = width1+x1;
                    let mY1 = height1+y1;

                    let x2 = o.x;
                    let y2 = o.y;
                    let width2 = o.width;
                    let height2 = o.height;
                    let mX2 = width2+x2;
                    let mY2 = height2+y2;
                    if( x1 < mX2
                        && mX1 > x2
                        && y1 < mY2
                        && mY1 > y2
                    ) {
                        return true;
                    }

                    return false;
                };
                container.isOverlapPoint = function (x2, y2) {
                    let x1 = container.x;
                    let y1 = container.y;
                    let width1 = W;
                    let height1 = H;
                    let mX1 = width1+x1;
                    let mY1 = height1+y1;

                    let width2 = 10;
                    let height2 = 10;
                    let mX2 = width2+x2;
                    let mY2 = height2+y2;
                    if( x1 < mX2
                        && mX1 > x2
                        && y1 < mY2
                        && mY1 > y2
                    ) {
                        return true;
                    }

                    return false;
                };

                container.getPortsCount = function () {
                    return portCount;
                };
                container.portPortion = container.width / (portCount / 2);

                return container;
            };

            this.linkPort = function (from, to, graphics) {
                let fromPortPosition =  from.switch.getPortPosition(from.port);
                let toPortPosition =  to.switch.getPortPosition(to.port);
                let fromPort = from.switch.getPortByNumber(from.port);
                let toPort = to.switch.getPortByNumber(to.port.toString());
                this.updateLinkPorts(graphics, fromPortPosition, toPortPosition, fromPort, toPort, from.switch, to.switch);
            };

            this.calculateLinePosition = function (from, to) {
                var position = {
                    from : {x : from.x, y: from.y},
                    to: {x:to.x, y:to.y} ,
                    middle : { x:to.x, y: from.y}
                };
                return position;
            };


            this.calculateMiddlePosition = function (from, to, fromPort, toPort, fromSwitch, toSwitch) {
                let numOfPortsFrom = fromSwitch.getPortsCount();
                let numOfPortsTo = toSwitch.getPortsCount();
                let fromPortPosFromStart = fromPort.getPortNumber() % (numOfPortsFrom / 2);
                let toPortPosFromStart = toPort.getPortNumber() % (numOfPortsTo / 2);
                let fromproporcion  = 0;
                let middleX = 0;
                let middleY = 0;
                let rcrossMiddleX = 0;
                let crossMiddleX1 = 0;
                let proporcion = 0;
                let toproporcion = 0;
                middleY = Math.abs(from.y - to.y) / 2 + from.y;
                if (from.y > to.y) {
                    middleY = Math.abs(from.y - to.y) / 2 + to.y;
                }
                proporcion = numOfPortsFrom / 2 - fromPortPosFromStart + toPortPosFromStart + 1;
                middleX = Math.abs(from.x - to.x) / proporcion;
                if (from.x > to.x) {
                    proporcion = numOfPortsTo / 2 - toPortPosFromStart + fromPortPosFromStart + 1;
                    middleX = Math.abs(from.x - to.x) / proporcion;
                    toproporcion = toSwitch.portPortion;
                    middleX = middleX * (numOfPortsTo / 2 - toPortPosFromStart + 1);
                    if ((toproporcion * (numOfPortsTo / 2 - toPortPosFromStart + 1)) > middleX) {
                        crossMiddleX = fromSwitch.getSwitchRightBorder();
                        crossMiddleX1 = toSwitch.getSwitchRightBorder();
                        if (crossMiddleX < crossMiddleX1) {
                            crossMiddleX = crossMiddleX1;
                        }
                        middleX = crossMiddleX + toproporcion * 2;
                    } else {
                        middleX = middleX + to.x;
                    }
                } else {
                    fromproporcion = fromSwitch.portPortion;
                    middleX = middleX * (numOfPortsFrom / 2 - fromPortPosFromStart + 1);
                    if ((fromproporcion * (numOfPortsFrom / 2 - fromPortPosFromStart + 1)) > middleX) {
                        crossMiddleX = fromSwitch.getSwitchRightBorder();
                        crossMiddleX1 = toSwitch.getSwitchRightBorder();
                        if (crossMiddleX < crossMiddleX1) {
                            crossMiddleX = crossMiddleX1;
                        }
                        middleX = crossMiddleX + fromproporcion * 2;
                    } else {
                        middleX = middleX + from.x;
                    }
                }
                return {x: middleX, y : middleY};
            };

            this.calculatePartLine = function (p, port, offset, positions) {
                let position = {x: p.x};
                if(port.portPosition == "top") {
                    position.y = p.y - offset;
                    //positions.push({x: p.x, y: position.y});
                } else if (port.portPosition == "bottom"){
                    position.y = p.y + offset;
                    //positions.push({x: p.x, y: position.y});
                }
                return position;
            };

            this.brokenLine = function (from , to) {
                if(from.y <= to.y) {
                    var position = {
                        to: {x:to.x, y:to.y} ,
                        from : { x: to.x, y: from.y}
                    };
                } else if(from.y >= to.y) {
                    var position = {
                        to: {x:to.x, y:to.y} ,
                        from : { x: from.x, y: to.y}
                    };

                }
                return position;
            };

            this.brokenLine2 = function (from , to) {
                if(from.y >= to.y) {
                    var position = {
                        to: {x:to.x, y:to.y} ,
                        from : { x: to.x, y: from.y}
                    };
                } else if(from.y <= to.y) {
                    var position = {
                        to: {x:to.x, y:to.y} ,
                        from : { x: from.x, y: to.y}
                    };

                }
                return position;
            };

            this.isFromPoint = function (sw, port, position) {
                let p = sw.getPortPosition(port.getPortNumber());
                if(p.x == position.x && p.y == position.y) {
                    return true;
                }
                return false;
            };

            this.sortSwitchByXPosition = function (d) {
                let sws = drawNetworkTopology.switchListObject;
                sws.sort(
                    function(obj1, obj2)
                    {
                        if(d == false) {
                            return obj1.x > obj2.x;
                        } else {
                            return obj1.x < obj2.x;
                        }
                    }
                );
                return sws;
            };

            this.sortSwitchByYPosition = function () {
                let sws = drawNetworkTopology.switchListObject;
                sws.sort(
                    function(obj1, obj2)
                    {
                        return obj1.y > obj2.y;
                    }
                );
                return sws;
            };

            this.getAvailableXPosition = function (from, to) {
                if(from.x < to.x ) {
                    sws = this.sortSwitchByXPosition(false);
                } else {
                    sws = this.sortSwitchByXPosition(true);
                }
                for(let i = 0; i < sws.length; i++ ) {
                    if(from.x < to.x ) {
                        for(let x = from.x; x < to.x; x++) {
                            if(sws[i].isOverlapPoint(x, from.y)) {
                                return {x : x, y : from.y, switch : sws[i]};
                            }
                        }
                    } else {
                        for(let x = from.x; x > to.x; x--) {
                            if(sws[i].isOverlapPoint(x, from.y)) {
                                return {x : x, y : from.y, switch : sws[i]};
                            }
                        }
                    }
                }
                return {x: to.x, y : from.y , switch: 'null'};
            };

            this.getLinePositions = function (from, to, fromPort, toPort, fromSwitch, toSwitch) {
                let positions = [];
                from1 = this.calculatePartLine(from, fromPort, 15);
                positions.push({x: from1.x, y: from1.y});
                to = this.getPortMiddle(toPort, to);
                to1 = this.calculatePartLine(to, toPort, toPort.getLineDist());

                var fP = getGlobalPosition(fromPort);
                var tP = getGlobalPosition(toPort);

                if(fromPort.portPosition == "top" && toPort.portPosition == "top") {

                    var fSP = getGlobalPosition(fromSwitch);
                    var tSP = getGlobalPosition(toSwitch);
                    if(fP.y > tP.y) {
                        let fNP = fSP.x + fromSwitch.width;
                        let mA = tSP.x - fNP;
                        if(fP.x < tP.x) {
                            if(mA <= 3) {
                                from1.x = from1.x - fromSwitch.width * Math.abs(mA)/100;
                                positions.push(from1);
                            }
                        } else {
                            let tNP = tSP.x + toSwitch.width;
                            let mA = fSP.x - tNP;
                            if (mA < 5) {
                                from1.x = from1.x + toSwitch.width * Math.abs(mA) /100;
                                positions.push(from1);
                            }
                        }
                        var  p1 = this.brokenLine(from1, to1);
                        positions.push({x: p1.from.x, y: p1.from.y});
                    } else {
                        let fSW = fSP.x + fromSwitch.width;
                        let mA = tP.x - fSW;
                        if(mA < 5) {
                            if(fSP.x <  tP.x) {
                                from1.x = from1.x - fromSwitch.width + (fromSwitch.width * Math.abs(mA) /100);
                                positions.push(from1);
                                var  p1 = this.brokenLine2(from1, to1);
                                positions.push({x: p1.from.x, y: p1.from.y});
                            } else {
                                var  p1 = this.brokenLine(from1, to1);
                                positions.push({x: p1.from.x, y: p1.from.y});
                            }

                        } else {
                            var  p1 = this.brokenLine(from1, to1);
                            positions.push({x: p1.from.x, y: p1.from.y});
                        }
                    }
                    console.log("From Top and  to Top");
                } else if(fromPort.portPosition == "bottom" && toPort.portPosition == "bottom") {
                    var fSP = getGlobalPosition(fromSwitch);
                    var tSP = getGlobalPosition(toSwitch);
                    if(fP.y < tP.y) {
                        let fSX = fSP.x + fromSwitch.width;
                        let mA =  tSP.x - fSX;
                        if(mA < 5) {
                            if(fP.x < tP.x) {
                                from1.x = from1.x - fromSwitch.width * Math.abs(mA) /100;
                                positions.push(from1);
                            } else {
                                if(fSP.x  < tSP.x + toSwitch.width) {
                                    let pX = tSP.x + toSwitch.width - fP.x;
                                    from1.x = from1.x + Math.abs(pX);
                                    positions.push(from1);
                                }
                            }
                        }
                        var  p1 = this.brokenLine2(from1, to1);
                        positions.push({x: p1.from.x, y: p1.from.y});
                    } else {
                        let fSX = fSP.x + fromSwitch.width;
                        if(fSX >= tP.x ) {
                            from1.x = from1.x - fromSwitch.width;
                            positions.push(from1);
                            var  p1 = this.brokenLine(from1, to1);
                            positions.push({x: p1.from.x, y: p1.from.y});
                        } else {
                            var  p1 = this.brokenLine2(from1, to1);
                            positions.push({x: p1.from.x, y: p1.from.y});
                        }
                    }
                    console.log("From Bottom and  to Bottom");
                } else if(fromPort.portPosition == "top" && toPort.portPosition == "bottom") {
                    var fSP = getGlobalPosition(fromSwitch);
                    var tSP = getGlobalPosition(toSwitch);
                    // TODO below 50 const need change to variable.
                    if(fP.y - 50 > tP.y) {
                        var  p1 = this.brokenLine(from1, to1);
                        positions.push({x: p1.from.x, y: p1.from.y});
                    } else {
                        let fSX = fSP.x + fromSwitch.width + 10;
                        if(fSX <= tSP.x) {
                            from1.x = from1.x + fromSwitch.width;
                            positions.push(from1);
                        } else {
                            if(tP.x + toSwitch.width > fSP.x) {
                                from1.x = from1.x + toSwitch.width + fromSwitch.width;
                                positions.push(from1);
                            } else {
                                from1.x = fSP.x + (fSP.x - fP.x - 20) ;
                                positions.push(from1);
                            }
                        }
                        var  p1 = this.brokenLine2(from1, to1);
                        positions.push({x: p1.from.x, y: p1.from.y});
                    }
                    console.log("From Top and  to Bottom");
                } else if(fromPort.portPosition == "bottom" && toPort.portPosition == "top") {
                    console.log("From Bottom and  to Top");
                    if(fP.y < tP.y) {
                        var  p1 = this.brokenLine(from1, to1);
                        positions.push({x: p1.from.x, y: p1.from.y});
                    } else {
                        var fSP = getGlobalPosition(fromSwitch);
                        var tSP = getGlobalPosition(toSwitch);
                        var mP = getMiddlePosition(fSP.x, fSP.y, tSP.x, tSP.y);
                        if(fP.x > tP.x) {
                            let m =(tSP.x + toSwitch.width) - fSP.x;
                            let mA = Math.abs(m);
                            if (m <= -10) {
                                from1.x = from1.x - mA ;
                            } else {
                                let fW = fromSwitch.width;
                                from1.x = from1.x + fW + (fW * mA /100);
                            }
                            positions.push(from1);
                            var  p1 = this.brokenLine(from1, to1);
                            positions.push({x: p1.from.x, y: p1.from.y});
                        } else {
                            let m = tSP.x - (fSP.x+fromSwitch.width);
                            console.log(m);
                            let mA = Math.abs(m);
                            if (m <= 10) {
                                from1.x = from1.x - mA -fromSwitch.width * 40 /100 ;
                            } else {
                                let fW = fromSwitch.width;
                                from1.x = from1.x + fW ; //+ (fW * mA /100);
                            }
                            positions.push(from1);
                            var  p1 = this.brokenLine(from1, to1);
                            positions.push({x: p1.from.x, y: p1.from.y});
                        }
                    }

                }

                positions.push({x: to1.x, y: to1.y});
                positions.push({x: to.x, y: to.y});
                return positions;
            };


	    this.getPortMiddle = function(port, p) {
                position ={};
                position.x = p.x - port.width/2;
                position.y = p.y;
                return position;
	    };

            this.updateLinkPorts = function (graphics, from, to, fromPort, toPort, fromSwitch, toSwitch) {
                graphics.clear();
                graphics.lineStyle(3, graphics.color, 1);
                graphics.toPort = toPort;
                graphics.fromPort = fromPort;
                toPort.line = graphics;
                fromPort.line = graphics;
                //graphics.beginFill(0x00FF00);

		        from = this.getPortMiddle(fromPort, from);
                graphics.moveTo(from.x, from.y);
                let positions = this.getLinePositions(from, to, fromPort, toPort, fromSwitch, toSwitch);
                for(var i = 0; i < positions.length; i++) {
                    graphics.lineTo(positions[i].x, positions[i].y);
                }
                graphics.endFill();
            };

            this.createLine = function (from, to, size ) {
                var graphics = new PIXI.Graphics();
                var position = this.calculateLinePosition(from, to);
                graphics.interactive = true;
                graphics.buttonMode = true;
                //graphics.beginFill(0x00FF00);
                graphics.color =  enableLineColor;
                graphics.lineStyle(size, graphics.color, 1);
                graphics.moveTo(position.from.x, position.from.y);
                graphics.lineTo(position.middle.x, position.middle.y);
                graphics.lineTo(position.to.x, position.to.y);
                graphics.endFill();
                graphics.setDisable  = function (isSend) {
                    let status = "disable";
                    graphics.toPort.setColor(disablePortColor, status, isSend);
                    graphics.fromPort.setColor(disablePortColor, status, isSend);
                    graphics.color = disableLineColor;
                };
                graphics.setEnable  = function (isSend) {
                    let status = "enable";
                    graphics.toPort.setColor(enablePortColor, status, isSend);
                    graphics.fromPort.setColor(enablePortColor, status, isSend);
                    graphics.color =  enableLineColor;
                };
                graphics.zIndex = 0;
                return graphics;
            };

        }

        var snmp = new SNMP(stage);

/*        socket.onmessage = function(event) {
            snmp.notifyAll(event.data);
        };*/



        if(drawNetworkTopology.switchList !== undefined && drawNetworkTopology.netList !== undefined) {
            // create switch(s)
            let switchList = drawNetworkTopology.switchList;
            for(let i = 0; i < switchList.length; i++) {
                // TODO need to add hera logic to calculation positions of switch
                let name = switchList[i].name;
                let portCount = switchList[i].portCount;
                let description = switchList[i].description;
                let enablePorts = getEnablePortsList(name, drawNetworkTopology.netList);
                var sw = snmp.createSwitch(name, portCount, description, enablePorts);
                let swLoc = undefined;
                swLoc = localStorage[name];

                //swLoc = undefined;
                if (swLoc === undefined) {
                    sw.x = sw.width * i;
                    sw.y = sw.height * i;
                } else {
                    swLoc = JSON.parse(swLoc);
                    sw.x = swLoc.x;
                    sw.y = swLoc.y;
                }
                stage.addChild(sw);
                drawNetworkTopology.switchListObject.push(sw);
            }

            // create line(s)
            let netList = drawNetworkTopology.netList;
            for(let i = 0; i < netList.length; i++) {
                let toSw = getChildByName(drawNetworkTopology.switchListObject, netList[i].toSwitch);
                let fromSw = getChildByName(drawNetworkTopology.switchListObject, netList[i].fromSwitch);
                let toPortNumber = netList[i].toPortNumber;
                let fromPortNumber = netList[i].fromPortNumber;
                let lineSize = netList[i].lineSize;
                let line = snmp.createLine({x:0, y: 0}, {x:10, y:10}, lineSize);
                stage.addChild(line);
                var lineObject = {
                    line: line,
                    toSw: toSw,
                    fromSw: fromSw,
                    toPortNumber: toPortNumber,
                    fromPortNumber: fromPortNumber,
                    lineSize: lineSize
                };
                drawNetworkTopology.netListObject.push(lineObject);
            }

        } else {
            console.error("ERROR: undefined switchList or netList");
            return;
        }

        function  lineUpdate() {
            let netList = drawNetworkTopology.netListObject;
            for(let i = 0; i < netList.length; i++) {
                let line = netList[i].line;
                let toSw = netList[i].toSw;
                let fromSw = netList[i].fromSw;
                let fromPortNumber = netList[i].fromPortNumber;
                let toPortNumber = netList[i].toPortNumber;
                snmp.linkPort({switch: fromSw, port: fromPortNumber}, {switch: toSw, port: toPortNumber}, line);
                renderer.render(stage);
            }
        }
        update();
        function update() {
            lineUpdate();
            renderer.render(stage);
            requestAnimationFrame(update);
        }
    }
    var loader = new PIXI.loaders.Loader();
    loader.add("delete", 'image/delete.png')
        .add("disable", 'image/disable.png')
        .add("port1", 'image/port1.png')
        .add("port2", 'image/port2.png')
        .add("enable", 'image/enable.png').load(main);

}

