package com.travel.sorewa.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

@Entity
@Table(name = "schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    // travelテーブルとの多対一（N:1）のリレーションを設定
    @ManyToOne
    @JoinColumn(name = "travel_id", nullable = false)
    private Travel travel;

    // userテーブル（最終編集者）との多対一（N:1）のリレーションを設定
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "plan", length = 255, nullable = false)
    private String plan;

    @Column(name = "items", columnDefinition = "TEXT")
    private String items;

    @Column(name = "budget", nullable = false)
    private Integer budget = 0;

    // 💡 AivenのUTC時計に邪魔させず、Javaから確実に日本時間を送るために insertable = true (デフォルト) に戻します
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // 🎯 【時差バスター】スケジュールが新しく登録される瞬間に、強制的に日本の時計を見て日時を刻みます
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
        this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
    }

    // 🎯 【時差バスター】予定の編集や、予算・持ち物が追加される瞬間に、最新の日本時間を上書きします
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
    }

    // --- ゲッター・セッター ---
    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public Travel getTravel() { return travel; }
    public void setTravel(Travel travel) { this.travel = travel; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public Integer getBudget() { return budget; }
    public void setBudget(Integer budget) { this.budget = budget; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
