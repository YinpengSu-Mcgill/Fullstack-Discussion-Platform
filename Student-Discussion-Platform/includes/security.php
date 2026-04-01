<?php


$encoder = new Encoder();

class Encoder
{
    function encrypt($input, $key='comp307') {
        $output = '';
        $inputLength = strlen($input);
        for ($i = 0; $i < $inputLength; $i++) {
            $char = $input[$i];
            $keyChar = $key[$i % strlen($key)];
            $output .= chr((ord($char) + ord($keyChar)) % 256);
        }
        return base64_encode($output);
    }

    function decrypt($input, $key='comp307') {
        $input = base64_decode($input);
        $output = '';
        $inputLength = strlen($input);
        for ($i = 0; $i < $inputLength; $i++) {
            $char = $input[$i];
            $keyChar = $key[$i % strlen($key)];
            $output .= chr((ord($char) - ord($keyChar) + 256) % 256);
        }
        return $output;
    }

}

