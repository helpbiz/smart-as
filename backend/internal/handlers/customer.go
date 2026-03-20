package handlers

import (
	"net/http"

	"smart-as/internal/models"
	"smart-as/internal/service"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	svc *service.Service
}

func NewCustomerHandler(svc *service.Service) *CustomerHandler {
	return &CustomerHandler{svc: svc}
}

func (h *CustomerHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.svc.RegisterUser(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *CustomerHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authResp, err := h.svc.LoginUser(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, authResp)
}

func (h *CustomerHandler) CreateRepairRequest(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.CreateRepairRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	rr, err := h.svc.CreateRepairRequest(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, rr)
}

func (h *CustomerHandler) GetRepairRequest(c *gin.Context) {
	id := c.Param("id")

	var requestID uint
	if _, err := parseUint(id, &requestID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	rr, err := h.svc.GetRepairRequestByID(requestID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, rr)
}

func (h *CustomerHandler) ListRepairRequests(c *gin.Context) {
	userID := c.GetUint("user_id")

	requests, err := h.svc.GetMyRepairRequests(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, requests)
}

func (h *CustomerHandler) UpdateFCMToken(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req models.UpdateFCMTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.svc.UpdateUserFCMToken(userID, req.FCMToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "fcm token updated"})
}

func parseUint(s string, v *uint) (int, error) {
	var n uint64
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, nil
		}
		n = n*10 + uint64(c-'0')
	}
	*v = uint(n)
	return 1, nil
}
