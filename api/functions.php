<?php
	function userTokenIsValid($token, $expiresAt){
		if($token!=NULL && $expiresAt!=NULL){			
			$today = date("Y-m-d H:i:s");
			return ($today<$expiresAt)?true:false;
		} else {
			return false;
		}
	}
	
	function userTokenUpdate($username){
		global $db;
		$time_limit = 7; // days
		try{
			($stmt = $db->prepare("UPDATE `eco_users` SET `api_token`=?, `api_token_expiration`=DATE_ADD(NOW(), INTERVAL ? DAY) WHERE `username`=?")) OR trigger_error();
			($stmt -> bind_param('sis', $token, $time_limit, $username)) OR trigger_error();
			$token = bin2hex(openssl_random_pseudo_bytes(16));
			($stmt -> execute()) OR trigger_error();
			$token = $stmt->affected_rows==1?$token:false;
			$stmt->close();		
			return $token;
		} catch(Exception $e) {
			throw new Exception('Internal server error');
		}
	}
	
	function updateUserLastLogin($username){
		global $db;
		try{
			($stmt = $db->prepare("UPDATE `eco_users` SET `logged_at`=NOW() WHERE `username`=?")) OR trigger_error();
			($stmt -> bind_param('s', $username)) OR trigger_error();
			($stmt -> execute()) OR trigger_error();
			$result = ($stmt->affected_rows==1);
			$stmt->close();		
			return $result;
		} catch(Exception $e) {
			throw new Exception('Internal server error');
		}
	}
	
	function userTokenCheck(){
		global $app, $db;
		
		try{
			$token = $app->request->headers->get('token');
			($stmt = $db->prepare("SELECT `api_token_expiration` FROM `eco_users` WHERE `api_token`=? LIMIT 1")) OR trigger_error('');
			($stmt -> bind_param('s', $token)) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			($stmt -> bind_result($expiresAt)) OR trigger_error('');
			($stmt->store_result()) OR trigger_error('');
			$tokenExists = $stmt->num_rows==1?true:false;
			if($tokenExists){
				($stmt->fetch()) OR trigger_error('');
			}
			($stmt->close()) OR trigger_error('');
		} catch(Exception $e) {
			$resp = array(
					'success' => false,
					'error' => "Internal server error"
			);
			$resp = json_encode($resp);
			$app->halt(500, $resp);
		}
		if ( !$tokenExists || !userTokenIsValid($token, $expiresAt) ) {
			$resp = array(
				'success' => false,
				'error' => "Unauthorized, bad credentials"
			);
			$resp = json_encode($resp);
			$app->halt(401, $resp);
		}
	}
	
	function getUserId($token){
		global $db;
		try{
			($stmt = $db->prepare("SELECT `id` FROM `eco_users` WHERE `api_token`=? LIMIT 1")) OR trigger_error('');
			($stmt -> bind_param('s', $token)) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			($stmt -> bind_result($user_id)) OR trigger_error('');
			($stmt->store_result()) OR trigger_error('');
			$userExists = $stmt->num_rows==1?true:false;
			if($userExists){
				($stmt->fetch()) OR trigger_error('');
			} else {
				trigger_error('');
			}
			($stmt->close()) OR trigger_error('');
		} catch(Exception $e) {
			trigger_error("Couldn't get user id");
		}
		return $user_id;
	}

	function getLinkedDeviceId($user_id){
		global $db;
		try{
			($stmt = $db->prepare("SELECT `id` FROM `eco_devices` WHERE `user_id`=? LIMIT 1")) OR trigger_error('');
			($stmt -> bind_param('i', $user_id)) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			($stmt -> bind_result($device_id)) OR trigger_error('');
			($stmt->store_result()) OR trigger_error('');
			$deviceExists = $stmt->num_rows==1?true:false;
			if($deviceExists){
				($stmt->fetch()) OR trigger_error('');
			} else {
				trigger_error('');
			}
			($stmt->close()) OR trigger_error('');
		} catch(Exception $e) {
			trigger_error("Couldn't get device id");
		}
		return $device_id;
	}
	
	function getLinkedDeviceImei($user_id){
		global $db;
		try{
			($stmt = $db->prepare("SELECT `imei` FROM `eco_devices` WHERE `user_id`=? LIMIT 1")) OR trigger_error('');
			($stmt -> bind_param('i', $user_id)) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			($stmt -> bind_result($device_imei)) OR trigger_error('');
			($stmt->store_result()) OR trigger_error('');
			$deviceExists = $stmt->num_rows==1?true:false;
			if($deviceExists){
				($stmt->fetch()) OR trigger_error('');
			} else {
				trigger_error('');
			}
			($stmt->close()) OR trigger_error('');
		} catch(Exception $e) {
			trigger_error("Couldn't get device imei");
		}
		return $device_imei;
	}

	function createSession($trainee, $intructor_id){
		global $db;
		$device_id = getLinkedDeviceId($intructor_id);
		try{
			($stmt = $db->prepare("INSERT INTO `eco_sessions`(`instructor_user_id`, `device_id`, `created_at`, `trainee_name`, `trainee_surname`, `trainee_company`, `trainee_birthday`, `trainee_license`) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)")) OR trigger_error('');
			($stmt -> bind_param('iisssss', $intructor_id, $device_id, $trainee['name'],  $trainee['surname'],  $trainee['company'],  $trainee['birthday'],  $trainee['license'])) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			$session_id = $db->insert_id;
			($stmt->close()) OR trigger_error('');
		} catch(Exception $e) {
			trigger_error("Couldn't create new driving session");
		}
		
		return $session_id;
	}

	function createTrip($trip, $session_id){
		global $db;
		$duration = (int)$trip['stop'] - (int)$trip['start'];
		
		try{
			($stmt = $db->prepare("INSERT INTO `eco_trips`(`session_id`, `start_at`, `stop_at`, `duration`) VALUES (?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), ?)")) OR trigger_error('');
			($stmt -> bind_param('iiii', $session_id, $trip['start'], $trip['stop'], $duration)) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			$trip_id = $db->insert_id;
			($stmt->close()) OR trigger_error('');
		} catch(Exception $e) {
			trigger_error("Couldn't create new trip");
		}
		
		return $trip_id;
	}
	
	function updateSessionWithTrips($session_id, $trip1_id, $trip2_id, $trip3_id){
		global $db;
		try{
			($stmt = $db->prepare("UPDATE `eco_sessions` SET `trip1_id`=?,`trip2_id`=?,`trip3_id`=? WHERE `id`=?")) OR trigger_error('');
			($stmt -> bind_param('iiii', $trip1_id, $trip2_id, $trip3_id, $session_id)) OR trigger_error('');
			($stmt -> execute()) OR trigger_error('');
			$result = ($stmt->affected_rows==1);
			$stmt->close();
			return $result;
		} catch(Exception $e) {
			throw new Exception("Couldn't update the driving session with trip ids");
		}
	}
	
	function getTimestampsForEngine($start, $stop){
		$date = new DateTime('now', new DateTimeZone('UTC'));
		
		$date->setTimestamp($start);
		$str = '"'.$date->format('Y-m-d H:i:s').'"';
		
		$date->setTimestamp($stop);
		$str .= ' "'.$date->format('Y-m-d H:i:s').'"';
		
		return $str;
	}
?>