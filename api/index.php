<?php
	require 'vendor/autoload.php';
	require ('vendor/palanik/corsslim/CorsSlim.php');
	
	$app = new \Slim\Slim();
	
	$corsOptions = array(
		"origin" => "*",
		"exposeHeaders" => array("token"),
		"maxAge" => 86400,
		"allowMethods" => array("POST, GET, OPTIONS")
	);
	$app->add(new \CorsSlim\CorsSlim());
	
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
							$response['expires'] = $db_api_token_expiration;
							
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
	
	$app->get('/v1/user/', 'userTokenCheck', function () use ($app, $db) {
		$response = array();
		$response['success'] = true;
		try{
			$user_info = getUserInfo($app->request->headers->get('token'));
			$response['user'] = $user_info;
		} catch(Exception $e) {
			$app->response->setStatus(500);
			$response['success'] = false;
			$response['error'] = $e->getMessage();
		}
		$response = json_encode($response);
		$app->response->setBody($response);
	});
	
	$app->post('/v1/session/', 'userTokenCheck', function () use ($app, $db) {
		try{
			$instructor_id = getUserId($app->request->headers->get('token'));
			$trainee_data = $app->request->params('traineeInfo');
			
			$new_session_id = createSession($trainee_data, $instructor_id);
			$trip1_id = createTrip($app->request->params('trip1'), $new_session_id);
			$trip2_id = createTrip($app->request->params('trip2'), $new_session_id);
			$trip3_id = createTrip($app->request->params('trip3'), $new_session_id);
			
			updateSessionWithTrips($new_session_id, $trip1_id, $trip2_id, $trip3_id);
			
			$response = array();
			$response['success'] = true;
			$response['sessionId'] = $new_session_id;
			
			$imei = getLinkedDeviceImei($instructor_id);
			
			$trip1Timestamps = getTimestampsForEngine($app->request->params('trip1')['start'], $app->request->params('trip1')['stop']);
			$trip2Timestamps = getTimestampsForEngine($app->request->params('trip2')['start'], $app->request->params('trip2')['stop']);
			$trip3Timestamps = getTimestampsForEngine($app->request->params('trip3')['start'], $app->request->params('trip3')['stop']);
			
			$tripTimestamps = $trip1Timestamps.' '.$trip2Timestamps.' '.$trip3Timestamps;
			
			$pyResults = exec('python ../engine/main.py '.$imei.' '.$tripTimestamps);
			
			$pyResults = explode("," , $pyResults);
			if(!is_array($pyResults) OR !isset($pyResults[0], $pyResults[1])){
				trigger_error('couldn\'t calculate results');
			} else {
				updateUserSessionNo($instructor_id);
				
				$response['results'] = array();
				$response['results']['instructor'] = $pyResults[0];
				$response['results']['trainee'] = $pyResults[1];
				$app->response->setStatus(201);
			}

		} catch(Exception $e) {
			$app->response->setStatus(500);
			$response['success'] = false;
			$response['error'] = $e->getMessage();
		}
		
		$response = json_encode($response);
		$app->response->setBody($response);
	});
	$app->run();
?>