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
?>