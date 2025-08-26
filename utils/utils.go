package utils

import "math/rand"

func RandomCode() string {
	chars := []rune("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
	code := make([]rune, 6)
	for i := range code {
		code[i] = chars[rand.Intn(len(chars))]
	}
	return string(code)
}