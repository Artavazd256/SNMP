<?php header('Access-Control-Allow-Origin: *'); ?>
<!DOCTYPE html>
<html>
<head>
    <title></title>
<!--    <script src="lib/pixi.js"> </script> </head>-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.4.3/pixi.min.js?random=<?php echo uniqid(); ?>"></script>
    <script src="lib/jquery-2.1.4.min.js?random=<?php echo uniqid(); ?>"></script>
    <script src="lib/jquery.mousewheel.min.js?random=<?php echo uniqid(); ?>"></script>
    <!-- <script src="lib/bump/bin/bump.js"> </script> </head> -->
    <script src="lib/snmp.js?random=<?php echo uniqid(); ?>"> </script> </head>
<body>
    <script>
        drawNetworkTopology.switchList = [];
        drawNetworkTopology.netList = [];
         $.post( "data.php", { action: "switch" }, 
                function( data ) { data = JSON.parse(data); 
                for(let i = 0; i < data.length; i++) { 
                    var sw = {name: data[i].key.toString(), description: data[i].name,
                    portCount: parseInt(data[i].bottomArray.length)+parseInt(data[i].topArray.length)};
                    drawNetworkTopology.switchList.push(sw);
            }
            $.post( "data.php", { action: "link" }, function( data ) {
                data = JSON.parse(data);
                for(let i = 0; i < data.length; i++) {
                    var l =  {fromSwitch: data[i].fromSwitch,
                                toSwitch: data[i].toSwitch,
                                toPortNumber: parseInt(data[i].toPortNumber),
                                fromPortNumber: parseInt(data[i].fromPortNumber), lineSize: 4};
                    drawNetworkTopology.netList.push(l);
                }
                SNMP = drawNetworkTopology();
        });
        });

        ////    drawNetworkTopology.netList = [
        ////    {fromSwitch: "switch1", toSwitch: "switch2", toPortNumber: 5, fromPortNumber:12, lineSize: 4},
        ////    {fromSwitch: "switch2", toSwitch: "switch3", toPortNumber: 9, fromPortNumber:7, lineSize: 23}
        ////];

    </script>
</body>
</html>
