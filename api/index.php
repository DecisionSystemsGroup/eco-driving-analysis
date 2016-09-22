<?php
	require 'vendor/autoload.php';
	$app = new \Slim\Slim();
	
	$app->response->headers->set('Content-Type', 'application/json;charset=utf-8');
	
	// Database Connection	
	$configs = include('/var/configs/api/config.php');
	$db = new mysqli($configs['db_host'], $configs['db_username'], $configs['db_password'], $configs['db_name']);
	$db->set_charset("utf8");
	
	require 'functions.php';
	
	$app->get('/', function () {
		echo 'Api Index';
	});

	$app->get('/v1/authentication/', function () use ($app, $db) {
		try{
			$response = array();
			$response['success'] = '';
			
			$username = $app->request->params('username');
			$password = $app->request->params('password');
			
			if( !isset($username, $password) ){
				$app->response->setStatus(400);
				$response['error'] = 'Invalid number of arguments';
			} else {
				try{
					($stmt = $db->prepare("SELECT `id`, `email`, `role`, `password_hash`, `name`, `surname`, `sessions_no`, `registered_at`, `logged_at`, `api_token`, `api_token_expiration`, `active` FROM `eco_users` WHERE `username`=?")) OR trigger_error();
					($stmt->bind_param('s', $username)) OR trigger_error();
					($stmt->execute()) OR trigger_error();
					($stmt->bind_result($db_id, $db_email, $db_role, $db_password_hash, $db_name, $db_surname, $db_sessions_no, $db_registered_at, $db_logged_at, $db_api_token, $db_api_token_expiration, $db_active)) OR trigger_error();
				} catch(Exception $e){
					throw new Exception('Internal server error');
				}
				$stmt->store_result();	//without store_result num_rows will be empty
				
				/**
				 * Check if the query returned result
				**/
				if( $stmt->num_rows<1 ){
					$stmt->close();
					$app->response->setStatus(403);
					$response['error'] = 'Bad credentials';
				} else{
					$stmt->fetch();
					$stmt->close();
					
					if($db_active==1){
						if(password_verify($password, $db_password_hash)){
							if(!userTokenIsValid($db_api_token, $db_api_token_expiration)){
								$db_api_token = userTokenUpdate($username);
							}
							$response['success'] = true;
							$response['token'] = $db_api_token;
							
							$response['user'] = array(
								'id' => $db_id,
								'username' => $username,
								'name' => $db_name,
								'surname' => $db_surname,
								'registered_at' => $db_registered_at,
								'last_login' => $db_logged_at,
								'sessions' => $db_sessions_no,
							);
							
							updateUserLastLogin($username);
							
							$app->response->setStatus(200);						
						} else {
							$app->response->setStatus(401);
							$response['error'] = 'Bad credentials';						
						}
					} else {
						$app->response->setStatus(403);
						$response['error'] = 'User not Active';
					}
				}
			}
			
		} catch (Exception $e){
			$response['success'] = false;
			$response['error'] = $e->getMessage();
		}
		$response['success'] = !isset($response['error']);
		$response = json_encode($response);
		$app->response->setBody($response);
	});
	
	$app->run();
?>