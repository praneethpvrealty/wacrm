package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"fmt"
	"testing"
)

func TestVerifySignature(t *testing.T) {
	secret := "secret-key"
	body := []byte(`{"object":"whatsapp_business_account","entry":[]}`)

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	computedSignature := mac.Sum(nil)
	signatureHeader := fmt.Sprintf("sha256=%x", computedSignature)

	if !verifySignature(body, signatureHeader, secret) {
		t.Errorf("Expected signature verification to succeed")
	}

	invalidHeader := "sha256=invalidhash"
	if verifySignature(body, invalidHeader, secret) {
		t.Errorf("Expected signature verification to fail for invalid hash")
	}

	nonShaHeader := "sha1=invalidhash"
	if verifySignature(body, nonShaHeader, secret) {
		t.Errorf("Expected signature verification to fail for non-sha256 prefix")
	}
}
