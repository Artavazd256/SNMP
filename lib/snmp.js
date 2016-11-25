/**
 * Created by ava on 10/24/16.
 */


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

            function deleteCon() {
                console.log("delete");
            }
            function disableCon() {
                this.port.line.setDisable();
                console.log("Enable");
            }
            function enableCon() {
                this.port.line.setEnable();
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

            this.getGlobalPosition = function(element) {
                let x = element.transform.tx;
                let y = element.transform.ty;
                return {x:x, y: y};
            };

            this.createPort = function (name, color, width, height, position, titleText, portCount) {
                var graphics = new PIXI.Graphics();
                graphics.beginFill(color);
                graphics.drawRect(0, 0, width, height);
                var indexPort = new PIXI.Text(name.toString(), this.stylePort);
                indexPort.x = width / 2;
                indexPort.y = height / 2;
                indexPort.anchor.set(0.5);
                graphics.addChild(indexPort);
                graphics.endFill();
                graphics.setColor = function (color) {
                    graphics.clear();
                    graphics.beginFill(color);
                    graphics.drawRect(0, 0, width, height);
                };
                //var sprite = this.getSpriteByGraphics(graphics);
                var sprite = graphics;
                //sprite.anchor.set(0.5, 0);
                sprite.name = "port" + name;
                sprite.portPosition = position;
                titleText = "MAC address: b8:90:e3:b10:28:44\nMAC address: b8:94:e0:b11:21:43\nMAC address: b18:70:e12:b2:27:43";
                var title = this.createTitle(titleText, 0xedef4d, 40, 24, position);
                title.visible = false;
                sprite.titleName = title.name;
                sprite.title = title;
                stage.addChild(title);
                var popupMenu = this.createPopupMenu(0x0FFF3F2, sprite);
                //sprite.addChild(popupMenu);
                stage.addChild(popupMenu);
                //sprite.addChild(title)
                sprite.title = title;
                sprite.popupMenu = popupMenu;
                sprite.interactive = true;
                sprite.buttonMode = true;
                sprite.mouseover = this.showTitleOfPOrt;
                sprite.mouseout = this.hideTitleOfPort;
                sprite.rightdown = this.showPopupMenu;
                sprite.getPortNumber = function () {
                    return name;
                };

                sprite.getLineDist = function () {
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
                sprite.hitArea = new PIXI.Rectangle(0, 0, sprite.width, sprite.height);
                return sprite;
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
                    bodyWidth = (portCount / 2.) * (dis);
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
                    disableElements();
                }
            };

            this.createSwitch = function (swName, portCount, text, enablePortsList) {
                var container = new PIXI.Container();
                container.interactive = true;
                container.buttonMode = true;
                container.name = swName;
                var index = 1;
                var dis = 20;
                var portLeftOfffset = 0;
                var portSize = 15;
                var bodyWidth = this.getSwitchWidth(portCount, dis);
                var bodyHeight = 70;
                var count = Math.floor(portCount / 2);
                //text = this.processingText(text, portCount);
                var isOdd = portCount % 2 == 0 ? false : true;
                if (isOdd) {
                    count++;
                }
                for (var row = 0; row < 3; row++) {
                    for (var i = 0; i < count; i++) {
                        let name = index.toString();
                        let portColor = enablePortsList.indexOf(index) !== -1 ? enablePortColor  :  disablePortColor;
                        if (row == 0) {
                            var port = this.createPort(name, portColor, portSize, portSize, "top", "tmp", portCount);
                            port.x = (dis * i)-port.width/2;
                            container.addChild(port);
                            index++;
                        } else if (row == 2) {
                            var port = this.createPort(name, portColor, portSize, portSize, "bottom", "tmp", portCount);
                            var body = container.getChildByName(swName);
                            port.x = dis * i + portLeftOfffset + (isOdd ? dis / 2 : 0) - (port.width/2);
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
                container.getPortPosition = function (number) {
                    number = number.toString();
                    var middlePortNumber = portCount/2;
                    var port = container.getChildByName("port"+number);
                    let h = middlePortNumber >= number ? 0 :  port.height;
                    var position = {x: port.worldTransform.tx + port.width/2, y: port.worldTransform.ty + h};
                    return position;
                };

                container.getSwitchRightBorder = function () {
                    var width = container.width;
                    var x = container.x;
                    return x + width;
                };

                container.isOverlap = function (o) {
                    let x1 = container.x;
                    let y1 = container.y;
                    let width1 = container.width;
                    let height1 = container.height;
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
                    let width1 = container.width;
                    let height1 = container.height;
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

            this.getLinePositions = function (from, to, fromPort, toPort, fromSwitch, toSwitch) {
                var positions = [];
                from1 = this.calculatePartLine(from, fromPort, toPort.getLineDist(), positions);
                positions.push({x: from1.x, y: from1.y});
                to1 = this.calculatePartLine(to, toPort, toPort.getLineDist(), positions);
                //var middle = this.calculateMiddlePosition(from1, to1, fromPort, toPort, fromSwitch, toSwitch);

/*                let sw = drawNetworkTopology.switchListObject;
                for(let i = 0; i < sw.length; i++) {

                }*/

                var  p1 = this.brokenLine(from1, to1);
                positions.push({x: p1.from.x, y: p1.from.y});

                //// TODO nedd to split this function (ziblanoc)
                ////r middle = {x:0, y:0};
                ////var middle = {x:0, y:0};

                //var  p1 = this.brokenLine(from, middle);
                //positions.push({x: p1.from.x, y: p1.from.y});
                //positions.push({x: p1.to.x, y: p1.to.y});
               //// if(p1.to.y < to.y) {
               ////     if(toPort.portPosition == "top") {
               ////         p1.to.y += (to.y - p1.to.y) - 20;
               ////     } else if (toPort.portPosition == "bottom"){
               ////         p1.to.y += (to.y - p1.to.y) + 30;
               ////     }
               ////     positions.push({x: p1.to.x, y: p1.to.y});
               //// }
                //var  p2 = this.brokenLine(p1.to, to);
                //positions.push({x: p2.from.x, y: p2.from.y});


                positions.push({x: to1.x, y: to1.y});
                positions.push({x: to.x, y: to.y});
                return positions;
            };

            this.updateLinkPorts = function (graphics, from, to, fromPort, toPort, fromSwitch, toSwitch) {
                graphics.clear();
                graphics.lineStyle(3, graphics.color, 1);
                graphics.moveTo(from.x, from.y);
                graphics.toPort = toPort;
                graphics.fromPort = fromPort;
                toPort.line = graphics;
                fromPort.line = graphics;
                //graphics.beginFill(0x00FF00);
                let positions = this.getLinePositions(from, to, fromPort, toPort, fromSwitch, toSwitch);
                for(var i = 0; i < positions.length; i++) {
                    graphics.lineTo(positions[i].x, positions[i].y);
                }
                graphics.endFill();
            };

            this.createLine = function (from, to, size) {
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
                graphics.setDisable  = function () {
                    graphics.toPort.setColor(disablePortColor);
                    graphics.fromPort.setColor(disablePortColor);
                    graphics.color = disableLineColor;

                };
                graphics.setEnable  = function () {
                    graphics.toPort.setColor(enablePortColor);
                    graphics.fromPort.setColor(enablePortColor);
                    graphics.color =  enableLineColor;
                };
                this.stage.addChild(graphics);
                return graphics;
            };

        }

        var snmp = new SNMP(stage);


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
                sw.x = sw.width * i;
                sw.y = sw.height * i;
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
        .add("enable", 'image/enable.png').load(main);

}

