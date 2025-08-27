package handlers

import (
    "net/http"
)

func StaticFileHandler() http.Handler {
    return http.FileServer(http.Dir("./web/static/"))
}