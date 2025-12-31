"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminRootLayout;
const AdminLayout_1 = __importDefault(require("@/app/admin/components/ui/AdminLayout"));
function AdminRootLayout({ children }) {
    return <AdminLayout_1.default>{children}</AdminLayout_1.default>;
}
