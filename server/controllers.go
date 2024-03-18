package main

import (
	"errors"
	"path"

	"github.com/gofiber/fiber/v2"
)

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
