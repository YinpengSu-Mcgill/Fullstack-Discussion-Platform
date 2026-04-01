<?php

$dbPath = __DIR__ . '/../models/data.db';

// create PDO connection
try {
    $db = new PDO("sqlite:" . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "DB connection error: " . $e->getMessage();
}

