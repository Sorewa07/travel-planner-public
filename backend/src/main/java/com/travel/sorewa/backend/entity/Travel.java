package com.travel.sorewa.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "travel")
public class Travel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "travel_id")
    private Long travelId;

    // userテーブルとの多対一（N:1）のリレーションを設定します
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "travel_destination", length = 100, nullable = false)
    private String travelDestination;

    @Column(name = "travel_id_sub", nullable = false)
    private Integer travelIdSub;

    // 💡 Aivenに邪魔させず、Javaから確実に日本時間を送るために insertable = true (デフォルト) に戻します
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // 🎯 【時差バスター】旅行先が新しく追加される瞬間に、強制的に日本の時計を見て日時を刻みます
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
        this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
    }

    // 🎯 【時差バスター】旅行先が編集・アップデートされる瞬間に、最新の日本時間を上書きします
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
    }

    // --- ゲッター・セッター ---
    public Long getTravelId() { return travelId; }
    public void setTravelId(Long travelId) { this.travelId = travelId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTravelDestination() { return travelDestination; }
    public void setTravelDestination(String travelDestination) { this.travelDestination = travelDestination; }

    public Integer getTravelIdSub() { return travelIdSub; }
    public void setTravelIdSub(Integer travelIdSub) { this.travelIdSub = travelIdSub; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
