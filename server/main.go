package main

import (
	"flag"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func parseArgs() (string, string) {
	portFlag := flag.String("port", "3000", "port number")
	dirFlag := flag.String("dir", "./", "directory to serve")
	flag.Parse()

	return *portFlag, *dirFlag
}

func main() {
	port, dir := parseArgs()

	app := fiber.New(fiber.Config{
		DisableStartupMessage:        true,
		DisablePreParseMultipartForm: true,
		StreamRequestBody:            true,
	})
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
	}))
	app.Use(logger.New())
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("base", dir)
		log.Println(dir)
		return c.Next()
	})

	app.Static("/data", dir, fiber.Static{ByteRange: true})
	app.Get("/entry", EntryController)
	app.Get("/dir", DirController)

	log.Printf("Listening to port %s, serving %s\n", port, dir)
	app.Listen(":" + port)
}
