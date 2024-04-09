package main

import (
	"log"
	"os"
	"path"
	"strings"
)

type EntryType string

const (
	Dir   EntryType = "dir"
	Text            = "text"
	Image           = "image"
	Video           = "video"
)

type EntryInfo struct {
	Type EntryType `json:"type"`
	Name string    `json:"name"`
}

func GetEntryType(entryPath string) (EntryType, error) {
	file, err := os.Open(entryPath)
	defer file.Close()
	if err != nil {
		return "", err
	}

	fileInfo, err := file.Stat()
	if err != nil {
		return "", err
	}

	if fileInfo.IsDir() {
		return "dir", nil
	}

	extension := path.Ext(entryPath)
	if len(extension) == 0 {
		return Text, nil
	}
	switch extension {
	case ".mp4", ".ts":
		return Video, nil
	case ".jpg", ".png", ".jpeg":
		return Image, nil
	default:
		return Text, nil
	}
}

func GetEntries(dirPath string) ([]EntryInfo, error) {
	entries := []EntryInfo{}
	os_files, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}
	for _, file := range os_files {
		fileName := file.Name()
		filePath := path.Join(dirPath, fileName)
		if len(fileName) == 0 {
			continue
		} else if fileName[0] == '.' {
			continue
		}

		if file.IsDir() {
			entries = append(entries, EntryInfo{Dir, fileName})
		} else {
			entryType, err := GetEntryType(filePath)
			if err != nil {
				log.Println(fileName)
				return nil, err
			}
			entries = append(entries, EntryInfo{
				entryType,
				fileName,
			})
		}
	}

	return entries, nil
}

func GetEntryName(path string) string {
	parts := strings.Split(path, "/")
	return parts[len(parts)-1]
}
