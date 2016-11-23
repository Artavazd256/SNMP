<?php

function getInterfaces($devID, $dbh)
{
    $interfaces = array(); 
    foreach($dbh->query("SELECT * FROM `interfaces` WHERE `device_id` = $devID ") as $rowInterface) {
        $macDB = $dbh->query("SELECT * FROM `MAC` WHERE `interface_id` = " . $rowInterface['id']);
        if( $macDB->rowCount() > 0) {
            foreach($macDB as $rowMAC) {
                $interfaces[] = array_merge($rowInterface, $rowMAC);
            }
        } else {
            $interfaces[] = $rowInterface;
        }
    }
    return $interfaces;

}

function addLink($links, $port, $key, $mac)
{
    $status = false;
    foreach($links as $index =>$link) {
        if($link['fromMac'] == $port['mac'] && $link['toMac'] == $mac) {
            //echo "fromMac = " . $link['fromMac'] . ", portMac = " . $port['mac'] . "\n";
            if($port['portId'] != '') {
                $links[$index]['toPortNumber'] = strval($port['portId']); 
                $links[$index]['toSwitch'] = $key; 
                $status = true;
            }
        }
    }
    return $status == true ? $links : null;
}


function createLinkDataArray($data) 
{

    $links = array();
    //{"from":1, "to":2, "fromPort":"top5", "toPort":"top8"}
    foreach($data as $val) {
        $mac = $val['mac'];
        $dKey = $val['key'];
        $ports = array_merge($val['topArray'], $val['bottomArray']);
        foreach($ports as $port) {
            $tmp = addLink($links, $port, $dKey, $mac);
            $links = $tmp == null ? $links : $tmp;
            if($tmp == null)
            {
                if($port['mac'] != '') {
                $links[] = array('fromSwitch' => strval($dKey)
                        , 'toSwitch' => ''
                        , 'fromPortNumber' => strval($port['portId'])
                        , 'toPortNumber' => ''
                        , 'toMac' => $port['mac']
                        , 'fromMac' => $mac 
                        );
                }

            } 
        }
    }
    foreach($links as $key => $val) {
        if($val['toSwitch'] == '') {
            unset($links[$key]);
        }
    }
    $tmp = array();
    foreach($links as $key => $val) {
        $tmp[] = $val;  
    }
    $links = $tmp; 
    //echo "<pre>";
    //print_r($links);
    //echo "</pre>";
    //exit(1);
    return $links;
}

function getUnknowDevices($devices, $dbh)
{
    $devID = rand();
    $macsDB = $dbh->query("SELECT * FROM `MAC`");
    $tmp = $devices;
    /*
    echo "<pre>";
    foreach($macsDB as $mac) {
        $devDB = $dbh->query("SELECT * FROM `devices` WHERE `MAC` = '$mac[mac]'");
        if( $devDB->rowCount() == 0 ) {
            foreach($dbh->query("SELECT * FROM `interfaces` WHERE `id` = $mac[interface_id]") as $inter) {
                print_r($inter);
                //print_r($inter['id'] . " :  " . $inter['device_id'] . " : " .  $inter['countMAC'] . "<br />");
                //foreach($dbh->query("SELECT * FROM `devices` WHERE `id` = '$inter[device_id]'") as $tmpDev) {
                //    $devices[] = array("name" => "Unknow device $mac[mac]"
                //                        , "id" => "unknow" . $devID
                //                        , "MAC" => $mac['mac']
                //                        , 'interfaces' => array( array("number" => "1", "mac" => $tmpDev['MAC']) ));
                //}
            
            }
        }
    }
    echo "</pre>";
    exit(1);
    */
    
    //SELECT i.*, d.* FROM interfaces i INNER JOIN devices d ON d.id = i.device_id WHERE i.countMAC <> 0
    foreach($dbh->query("SELECT i.*, d.*, i.id as interfaceId FROM interfaces i INNER JOIN devices d ON d.id = i.device_id WHERE i.countMAC <> 0") as $data) {
           foreach($dbh->query("SELECT m.MAC FROM interfaces i INNER JOIN MAC m ON i.id = m.interface_id WHERE m.interface_id = $data[interfaceId] LIMIT 1") as $MAC) {
        $devices[] = array("name" => "Unknow device $data[countMAC]"
                            , "id" => "unknow" . $devID
                            , "MAC" => $MAC['MAC']
                            , 'interfaces' => array( array("number" => "1", "mac" => $data['MAC']) ));
       }
    
    }
    return $devices;
        
}


function createDevices($data) 
{
    $result = array();
    foreach($data as $key => $row) {
        $dev = array();  
        $dev['name'] = $row['name'];
        $dev['mac'] = $row['MAC'];
        $dev['key'] = $row['id'];
        $topArray = array();
        $bottomArray = array();
        $portList = array();
        $portCount = 0;
        $indexPort = 0;
        $tmp = array();
        foreach($row["interfaces"] as $port1) {
            $tmp[] = $port1['number'];
        }
        $portCount = count(array_unique($tmp));
        $dividePort = $portCount/2;
        foreach($row["interfaces"] as $index => $port) {
            if($port['link'] == '1') {
                $color = "#66ff33";
            } else {
                $color = "#ffcc00";
            }
            if(in_array($port['number'], $portList)) {
                continue;
            }
            $portList[] = $port['number'];
            if($indexPort < $dividePort) {
                //{"portColor":"#d488a2", "portNumber": "1", "portId":"top0"}

                $topArray[]=array("portColor" => $color, "portNumber" => $port['number'], "portId" => strval($port['number']), 'mac' => isset($port['mac']) ? $port['mac'] : "");
            } else {
                $bottomArray[]=array("portColor" => $color, "portNumber" => $port['number'], "portId" => strval($port['number']), 'mac' => isset($port['mac']) ? $port['mac'] : "");
            }

            $indexPort =  $indexPort + 1;
        }
        $dev['topArray'] = $topArray;
        $dev['bottomArray'] = $bottomArray;
        $result[] = $dev;
    }
    return $result;
}
	try {
		$devices = array();
		$dbh = new PDO('mysql:host=localhost;dbname=SNMP', 'root', 'AvaG');
		foreach($dbh->query('SELECT * FROM `devices`') as $row) {
			$devices[] = $row;
		}
        foreach($devices as $index => $row ) {
            $devices[$index]['interfaces'] = getInterfaces($row['id'], $dbh);
        }
        //$devices =  getUnknowDevices($devices, $dbh);
        $dev = createDevices($devices);

        $links = json_encode(createLinkDataArray($dev));
        $devS = json_encode($dev);
		$dbh = null;
	} catch (PDOException $e) {
		print "Error!: " . $e->getMessage() . "<br/>";
		die();
	}
    if( isset($_POST['action']) && $_POST['action'] == 'switch')  {
        echo $devS;
    }

    if( isset($_POST['action']) && $_POST['action'] == 'link')  {
        echo $links;
    }

	//$alldata = '{ "nodeDataArray": ' . $devS . ',' . ' "linkDataArray": ' . $links . '}';
    //echo "<pre>";
    //echo $alldata;
    //echo "</pre>";
	
?>
