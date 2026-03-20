package fcm

import (
	"context"
	"fmt"
	"log"

	"smart-as/internal/config"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

type FCMClient struct {
	client *messaging.Client
	enabled bool
}

func NewClient(cfg *config.FCMConfig) (*FCMClient, error) {
	if cfg == nil || cfg.CredentialsFile == "" {
		log.Println("FCM: Credentials not configured, push notifications disabled")
		return &FCMClient{enabled: false}, nil
	}

	ctx := context.Background()
	opt := option.WithCredentialsFile(cfg.CredentialsFile)

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Firebase app: %w", err)
	}

	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize FCM client: %w", err)
	}

	log.Println("FCM: Client initialized successfully")
	return &FCMClient{client: client, enabled: true}, nil
}

func (f *FCMClient) IsEnabled() bool {
	return f.enabled
}

func (f *FCMClient) SendNotification(ctx context.Context, token string, title string, body string, data map[string]string) error {
	if !f.enabled {
		log.Printf("FCM: Notification skipped (disabled) - Title: %s, Body: %s", title, body)
		return nil
	}

	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data: data,
		Token: token,
	}

	response, err := f.client.Send(ctx, message)
	if err != nil {
		log.Printf("FCM: Failed to send notification: %v", err)
		return err
	}

	log.Printf("FCM: Notification sent successfully - MessageID: %s", response)
	return nil
}

func (f *FCMClient) SendToMultiple(ctx context.Context, tokens []string, title string, body string, data map[string]string) error {
	if !f.enabled {
		log.Printf("FCM: Bulk notification skipped (disabled)")
		return nil
	}

	message := &messaging.MulticastMessage{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data: data,
		Tokens: tokens,
	}

	response, err := f.client.SendEachForMulticast(ctx, message)
	if err != nil {
		log.Printf("FCM: Failed to send bulk notification: %v", err)
		return err
	}

	log.Printf("FCM: Bulk notification sent - Success: %d, Failure: %d", response.SuccessCount, response.FailureCount)
	return nil
}
