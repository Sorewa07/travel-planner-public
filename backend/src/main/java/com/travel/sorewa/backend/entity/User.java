package com.travel.sorewa.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "user")
public class User {

    @Id
    @Column(name = "user_id", length = 8)
    private String userId;

    @Column(name = "user_name", length = 48, nullable = false)
    private String userName;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    // 💡 Aivenに邪魔させず、Javaから確実に日本時間を送るために insertable = true (デフォルト) に戻します
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // 🎯 【時差バスター】データがデータベースに「保存」される瞬間に、強制的に日本の時計を見て日時を刻みます
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
        this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
    }

    // 🎯 【時差バスター】データが「更新」される瞬間に、最新の日本時間を上書きします
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
    }

    // --- ここから下はJavaがデータを扱うための必須コード（ゲッター・セッター）です ---
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
