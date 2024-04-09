package main

import (
	"errors"
	"flag"
	"log"
	"path"

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
		DisablePreParseMultipartForm: true,
		StreamRequestBody:            true,
	})
	app.Use(logger.New())
	app.Use(cors.New())

	app.Use(func(c *fiber.Ctx) error {
		c.Locals("base", dir)
		log.Println(dir)
		return c.Next()
	})

	app.Static("/api/data", dir, fiber.Static{ByteRange: true})
	app.Get("/api/entry", EntryController)
	app.Get("/api/dir", DirController)

	app.Static("/", "./public")
	app.Static("/*", "./public/index.html")

	app.Listen(":" + port)
}

func EntryController(c *fiber.Ctx) error {
	base := c.Locals("base").(string)
	entryPath := c.Query("path")
	fullPath := path.Join(base, entryPath)
	entryType, err := GetEntryType(fullPath)
	entryName := GetEntryName(fullPath)
	if err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"type": entryType,
		"name": entryName,
	})
}

func DirController(c *fiber.Ctx) error {
	base := c.Locals("base").(string)
	entryPath := c.Query("path")
	fullPath := path.Join(base, entryPath)
	entryType, err := GetEntryType(fullPath)
	if err != nil {
		return err
	}

	if entryType != Dir {
		return errors.New("entry is not dir")
	}

	entries, err := GetEntries(fullPath)
	if err != nil {
		return err
	}

	return c.JSON(fiber.Map{
		"entries": entries,
	})
}
